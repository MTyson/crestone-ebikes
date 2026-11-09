import { supabase } from '../lib/supabase';
import { INITIAL_LISTINGS } from '../data/mockListings';
import {
  AppUser,
  Listing,
  ListingContact,
  ListingStatus,
  NewListingInput,
} from '../types/listing';

/**
 * Data layer for Crestone E-Bike.
 *
 * - Supabase configured  -> Postgres + Storage + Auth are the only source of truth.
 *   Errors are thrown so the UI can show them (we never fall back to fake data).
 * - Supabase NOT configured -> interactive prototype backed by localStorage.
 */

const STORAGE_KEY = 'crestone_ebikes_listings_v3';
const USER_STORAGE_KEY = 'crestone_ebikes_user_v1';
const PHOTO_BUCKET = 'listing-photos';

// ---------------------------------------------------------------------------
// Prototype (localStorage) helpers
// ---------------------------------------------------------------------------

function readLocal(): Listing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Listing[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not read localStorage listings:', err);
  }
  writeLocal(INITIAL_LISTINGS);
  return INITIAL_LISTINGS;
}

function writeLocal(listings: Listing[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  } catch {
    throw new Error('Browser storage is full. Try fewer or smaller photos in prototype mode.');
  }
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export async function fetchListings(): Promise<Listing[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Listing[];
  }
  return readLocal();
}

export async function createListing(
  input: NewListingInput,
  user: AppUser
): Promise<Listing> {
  const { seller_email, seller_phone, preferred_contact, ...publicFields } = input;

  if (supabase) {
    const { data, error } = await supabase
      .from('listings')
      .insert([{ ...publicFields, user_id: user.id }])
      .select('*')
      .single();
    if (error) throw new Error(error.message);

    const listing = data as Listing;
    const { error: contactError } = await supabase.from('listing_contacts').insert([
      {
        listing_id: listing.id,
        seller_email,
        seller_phone: seller_phone || null,
        preferred_contact,
      },
    ]);
    if (contactError) {
      // Don't leave a listing nobody can contact the seller about.
      await supabase.from('listings').delete().eq('id', listing.id);
      throw new Error(contactError.message);
    }
    return listing;
  }

  const listing: Listing = {
    ...input,
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
    user_id: user.id,
    status: 'active',
    ceb_approved: false,
  };
  writeLocal([listing, ...readLocal()]);
  return listing;
}

export async function updateListingStatus(id: string, status: ListingStatus): Promise<void> {
  if (supabase) {
    const { data, error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id)
      .select('id');
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      // RLS filters rows silently, so zero rows means "not yours".
      throw new Error('You can only change your own listings.');
    }
    return;
  }
  writeLocal(readLocal().map((l) => (l.id === id ? { ...l, status } : l)));
}

export async function deleteListing(listing: Listing): Promise<void> {
  if (supabase) {
    const { data, error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listing.id)
      .select('id');
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error('You can only delete your own listings.');
    }
    // Best-effort cleanup of the photos in Storage.
    const paths = (listing.image_urls ?? [])
      .map(photoPathFromUrl)
      .filter((p): p is string => Boolean(p));
    if (paths.length > 0) {
      await supabase.storage.from(PHOTO_BUCKET).remove(paths);
    }
    return;
  }
  writeLocal(readLocal().filter((l) => l.id !== listing.id));
}

/** "Show contact info": fetched for one listing at a time, on request. */
export async function fetchListingContact(listing: Listing): Promise<ListingContact> {
  if (supabase) {
    const { data, error } = await supabase.rpc('get_listing_contact', {
      p_listing_id: listing.id,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('Contact info is not available for this listing.');
    return row as ListingContact;
  }
  if (!listing.seller_email) {
    throw new Error('Contact info is not available for this listing.');
  }
  return {
    seller_email: listing.seller_email,
    seller_phone: listing.seller_phone,
    preferred_contact: listing.preferred_contact ?? 'Text or Email',
  };
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

function photoPathFromUrl(url: string): string | null {
  const marker = `/${PHOTO_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
}

/** Downscale + re-encode as JPEG. Respects EXIF rotation and keeps aspect ratio. */
async function resizeImage(file: File, maxDim: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process photo in this browser.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process photo.'))),
      'image/jpeg',
      quality
    )
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read photo.'));
    reader.readAsDataURL(blob);
  });
}

/** Uploads photos and returns their public URLs (data URLs in prototype mode). */
export async function uploadListingPhotos(files: File[], user: AppUser): Promise<string[]> {
  if (!supabase) {
    const urls: string[] = [];
    for (const file of files) {
      urls.push(await blobToDataUrl(await resizeImage(file, 900, 0.75)));
    }
    return urls;
  }

  const uploadedPaths: string[] = [];
  try {
    const urls: string[] = [];
    for (const file of files) {
      const blob = await resizeImage(file, 1600, 0.85);
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, {
        contentType: 'image/jpeg',
        cacheControl: '31536000',
      });
      if (error) throw new Error(`Photo upload failed: ${error.message}`);
      uploadedPaths.push(path);
      urls.push(supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl);
    }
    return urls;
  } catch (err) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(PHOTO_BUCKET).remove(uploadedPaths);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Sends a Supabase magic link (or instantly "signs in" in prototype mode). */
export async function sendMagicLinkEmail(email: string): Promise<{
  mode: 'supabase' | 'prototype';
  user?: AppUser;
}> {
  const cleanEmail = email.trim().toLowerCase();

  if (supabase) {
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true,
      },
    });
    if (error) throw new Error(error.message);
    return { mode: 'supabase' };
  }

  const demoUser: AppUser = {
    id: `demo-${cleanEmail}`,
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
    isDemo: true,
  };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoUser));
  return { mode: 'prototype', user: demoUser };
}

/** Prototype-mode session. With Supabase, use onAuthChange() instead. */
export function getPrototypeUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

/**
 * Subscribes to Supabase session changes (initial load, magic-link redirect,
 * sign-out, token refresh). Returns an unsubscribe function.
 */
export function onAuthChange(callback: (user: AppUser | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const u = session?.user;
    callback(u && u.email ? { id: u.id, email: u.email } : null);
  });
  return () => data.subscription.unsubscribe();
}

export async function signOutUser(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(USER_STORAGE_KEY);
}
