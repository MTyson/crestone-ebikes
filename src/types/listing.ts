export type ListingCategory = 'ebike' | 'battery' | 'parts' | 'accessories';

export type ListingCondition = 'Like New' | 'Good' | 'Fair' | 'Needs Work / Parts';

export type ListingStatus = 'active' | 'pending' | 'sold';

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
  ceb_approved?: boolean;
  wade_inspected?: boolean; // backwards compatibility alias
  inspection_note?: string;
  wade_note?: string; // backwards compatibility alias
  status: ListingStatus;

  // Optional e-bike specs
  brand?: string;
  motor_watts?: string;
  battery_spec?: string;
  range_estimate?: string;
  mileage?: string;
  wheel_size?: string;

  // Seller contact details
  seller_name: string;
  seller_email: string;
  seller_phone?: string;
  preferred_contact: 'Text or Call' | 'Email Only' | 'Text or Email';
}

export interface NewListingInput {
  title: string;
  category: ListingCategory;
  price: number;
  condition: ListingCondition;
  location: string;
  description: string;
  image_url: string;
  ceb_approved?: boolean;
  wade_inspected?: boolean;
  inspection_note?: string;
  wade_note?: string;
  brand?: string;
  motor_watts?: string;
  battery_spec?: string;
  range_estimate?: string;
  mileage?: string;
  wheel_size?: string;
  seller_name: string;
  seller_email: string;
  seller_phone?: string;
  preferred_contact: 'Text or Call' | 'Email Only' | 'Text or Email';
}

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  isDemo?: boolean;
}

