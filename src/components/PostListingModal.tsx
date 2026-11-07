import React, { useState } from 'react';
import { X, PlusCircle, ShieldCheck, Sparkles, Mail } from 'lucide-react';
import { AppUser, ListingCategory, ListingCondition, NewListingInput } from '../types/listing';

interface PostListingModalProps {
  isOpen: boolean;
  currentUser: AppUser | null;
  onClose: () => void;
  onSubmitListing: (input: NewListingInput) => Promise<void>;
  onOpenAuthModal: () => void;
  onOpenDonateModal: () => void;
}

const PRESET_IMAGES: { label: string; url: string }[] = [
  {
    label: 'Fat-Tire Mountain E-Bike',
    url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Step-Through Cruiser E-Bike',
    url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Backcountry / Commuter Bike',
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Battery Pack / Charger / Gear',
    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
  },
];

export const PostListingModal: React.FC<PostListingModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSubmitListing,
  onOpenAuthModal,
  onOpenDonateModal,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ListingCategory>('ebike');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('Good');
  const [location, setLocation] = useState('Baca Grande — Chalets I');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [wadeInspected, setWadeInspected] = useState(false);

  // Optional E-Bike specs
  const [brand, setBrand] = useState('');
  const [motorWatts, setMotorWatts] = useState('');
  const [batterySpec, setBatterySpec] = useState('');
  const [rangeEstimate, setRangeEstimate] = useState('');

  // Seller details
  const [sellerName, setSellerName] = useState(currentUser?.name || '');
  const [sellerEmail, setSellerEmail] = useState(currentUser?.email || '');
  const [sellerPhone, setSellerPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<
    'Text or Call' | 'Email Only' | 'Text or Email'
  >('Text or Email');

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    setSubmitting(true);
    try {
      await onSubmitListing({
        title: title.trim(),
        category,
        price: Number(price),
        condition,
        location: location.trim() || 'Crestone / Baca Grande',
        description: description.trim(),
        image_url: imageUrl.trim() || PRESET_IMAGES[0].url,
        wade_inspected: wadeInspected,
        brand: brand.trim() || undefined,
        motor_watts: motorWatts.trim() || undefined,
        battery_spec: batterySpec.trim() || undefined,
        range_estimate: rangeEstimate.trim() || undefined,
        seller_name: sellerName.trim() || 'Crestone Neighbor',
        seller_email: sellerEmail.trim() || currentUser?.email || 'neighbor@crestoneebikes.com',
        seller_phone: sellerPhone.trim() || undefined,
        preferred_contact: preferredContact,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Free Community Listing
            </span>
            <h2 className="font-serif-display text-2xl font-bold text-stone-900">
              Post an E-Bike or Related Gear
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {/* Magic Link Auth Prompt Banner if not signed in */}
          {!currentUser && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-stone-700">
                <strong className="text-stone-900 block">
                  Want to edit or mark your listing as sold later?
                </strong>
                Sign in with a simple passwordless email link (Supabase Magic Link), or post right
                now below.
              </div>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 shrink-0 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Magic Link</span>
              </button>
            </div>
          )}

          {/* Title & Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Listing Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Rad Power RadRunner Plus w/ Passenger Seat"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Price (USD) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="950"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ListingCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:border-emerald-700"
              >
                <option value="ebike">E-Bike</option>
                <option value="battery">Battery / Charger</option>
                <option value="parts">Parts &amp; Fat Tires</option>
                <option value="accessories">Trailers &amp; Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ListingCondition)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:border-emerald-700"
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Work / Parts">Needs Work / Parts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Neighborhood
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Town of Crestone / Chalets"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          {/* E-Bike Specs (shown for e-bikes or batteries) */}
          {(category === 'ebike' || category === 'battery') && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                E-Bike &amp; Battery Specs (Optional)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Brand (e.g. Aventon)"
                  className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
                <input
                  type="text"
                  value={motorWatts}
                  onChange={(e) => setMotorWatts(e.target.value)}
                  placeholder="Motor (e.g. 750W Hub)"
                  className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
                <input
                  type="text"
                  value={batterySpec}
                  onChange={(e) => setBatterySpec(e.target.value)}
                  placeholder="Battery (e.g. 48V 14Ah)"
                  className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
                <input
                  type="text"
                  value={rangeEstimate}
                  onChange={(e) => setRangeEstimate(e.target.value)}
                  placeholder="Range (e.g. 35 miles)"
                  className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Description &amp; History *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell neighbors about the bike, tire sealant, included chargers/racks, or any quirks..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-700"
            />
          </div>

          {/* Photo URL or Quick Preset */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Photo URL (or choose a preset photo for prototype testing)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs mb-2 focus:outline-none focus:border-emerald-700"
            />
            <div className="flex flex-wrap gap-1.5">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                    imageUrl === preset.url
                      ? 'bg-emerald-900 text-white border-emerald-900'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wade Inspected Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
            <input
              type="checkbox"
              checked={wadeInspected}
              onChange={(e) => setWadeInspected(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded accent-emerald-800"
            />
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                Wade has inspected or serviced this bike/battery at his shop
              </span>
              <span className="text-stone-600 block mt-0.5">
                Check this if Wade has already load-tested the battery or tuned this bike.
              </span>
            </div>
          </label>

          {/* Seller Contact Info */}
          <div className="pt-2 border-t border-stone-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Your Contact Details (Shown to Interested Buyers)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Your Name (e.g. Jamie M.) *"
                className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
              <input
                type="email"
                required
                value={sellerEmail}
                onChange={(e) => setSellerEmail(e.target.value)}
                placeholder="Your Email *"
                className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
              <input
                type="tel"
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="Phone (Optional)"
                className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-600">
              <span className="font-semibold">Preferred Contact:</span>
              {(['Text or Email', 'Text or Call', 'Email Only'] as const).map((opt) => (
                <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="preferredContact"
                    checked={preferredContact === opt}
                    onChange={() => setPreferredContact(opt)}
                    className="accent-emerald-800"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit + Optional Community Donation Nudge */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDonateModal();
              }}
              className="text-xs text-stone-600 hover:text-emerald-800 inline-flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Posting is 100% free — chip in to the shop coffee jar anytime</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

