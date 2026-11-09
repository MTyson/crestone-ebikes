export type ListingCategory = 'ebike' | 'battery' | 'parts' | 'accessories';

export type ListingCondition = 'Like New' | 'Good' | 'Fair' | 'Needs Work / Parts';

export type ListingStatus = 'active' | 'pending' | 'sold';

export type PreferredContact = 'Text or Call' | 'Email Only' | 'Text or Email';

export interface Listing {
  id: string;
  created_at: string;
  user_id?: string | null;
  title: string;
  category: ListingCategory;
  price: number;
  condition: ListingCondition;
  location: string;
  description: string;
  image_url: string;
  image_urls?: string[];
  /** Crestone E-Bike Approved. Only settable from the Supabase dashboard. */
  ceb_approved?: boolean;
  inspection_note?: string | null;
  status: ListingStatus;

  // Optional e-bike specs
  brand?: string | null;
  motor_watts?: string | null;
  battery_spec?: string | null;
  range_estimate?: string | null;
  mileage?: string | null;
  wheel_size?: string | null;

  seller_name: string;

  // Prototype mode only. With Supabase these live in a private table and are
  // fetched on demand via fetchListingContact().
  seller_email?: string;
  seller_phone?: string | null;
  preferred_contact?: PreferredContact;
}

export interface ListingContact {
  seller_email: string;
  seller_phone?: string | null;
  preferred_contact: PreferredContact;
}

/** What the Post form collects (photos are uploaded separately). */
export interface NewListingForm {
  title: string;
  category: ListingCategory;
  price: number;
  condition: ListingCondition;
  location: string;
  description: string;
  brand?: string;
  motor_watts?: string;
  battery_spec?: string;
  range_estimate?: string;
  mileage?: string;
  wheel_size?: string;
  seller_name: string;
  seller_email: string;
  seller_phone?: string;
  preferred_contact: PreferredContact;
}

/** Form data plus uploaded photo URLs; what the service layer persists. */
export interface NewListingInput extends NewListingForm {
  image_url: string;
  image_urls: string[];
}

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  isDemo?: boolean;
}
