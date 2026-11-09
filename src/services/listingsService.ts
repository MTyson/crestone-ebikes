import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_LISTINGS } from '../data/mockListings';
import { AppUser, Listing, ListingStatus, NewListingInput } from '../types/listing';

const STORAGE_KEY = 'crestone_ebikes_listings_v2';
const USER_STORAGE_KEY = 'crestone_ebikes_user_v1';

/**
 * Fetches listings from Supabase if configured, or falls back to local storage
 * seeded with realistic Crestone community listings.
 */
export async function fetchListings(): Promise<Listing[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as Listing[];
    }
    console.warn('Supabase fetch failed, falling back to local prototype data:', error?.message);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Listing[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read localStorage listings:', err);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LISTINGS));
  return INITIAL_LISTINGS;
}

/**
 * Creates a new listing in Supabase (when configured) or persists in local prototype storage.
 */
export async function createListing(
  input: NewListingInput,
  currentUser: AppUser | null
): Promise<Listing> {
  const newListing: Listing = {
    ...input,
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
    user_id: currentUser?.id ?? null,
    status: 'active',
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          ...input,
          user_id: currentUser?.id ?? null,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as Listing;
  }

  const current = await fetchListings();
  const updated = [newListing, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newListing;
}

/**
 * Toggles a listing between active and sold status.
 */
export async function toggleListingSoldStatus(id: string): Promise<Listing[]> {
  const current = await fetchListings();
  const target = current.find((item) => item.id === id);
  if (!target) return current;

  const nextStatus: ListingStatus = target.status === 'sold' ? 'active' : 'sold';

  if (isSupabaseConfigured && supabase) {
    await supabase.from('listings').update({ status: nextStatus }).eq('id', id);
  }

  const updated = current.map((item) =>
    item.id === id ? { ...item, status: nextStatus } : item
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Sends a Supabase Magic Link email OTP (or simulates magic link login in prototype mode).
 */
export async function sendMagicLinkEmail(email: string): Promise<{
  mode: 'supabase' | 'prototype';
  user?: AppUser;
}> {
  const cleanEmail = email.trim().toLowerCase();
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      throw new Error(error.message);
    }
    return { mode: 'supabase' };
  }

  // Prototype mode: simulate instant magic link verification
  const demoUser: AppUser = {
    id: `demo-${cleanEmail}`,
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
    isDemo: true,
  };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoUser));
  return { mode: 'prototype', user: demoUser };
}

export async function getCurrentUser(): Promise<AppUser | null> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user && data.user.email) {
      return {
        id: data.user.id,
        email: data.user.email,
      };
    }
    return null;
  }

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(USER_STORAGE_KEY);
}

