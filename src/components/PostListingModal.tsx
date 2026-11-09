import React, { useEffect, useMemo, useState } from 'react';
import { X, PlusCircle, Sparkles, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { AppUser, ListingCategory, ListingCondition, NewListingForm, PreferredContact } from '../types/listing';

const MAX_PHOTOS = 4;

interface PostListingModalProps {
  isOpen: boolean;
  currentUser: AppUser | null;
  onClose: () => void;
  onSubmitListing: (input: NewListingForm, photos: File[]) => Promise<void>;
  onOpenDonateModal: () => void;
}

export const PostListingModal: React.FC<PostListingModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSubmitListing,
  onOpenDonateModal,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ListingCategory>('ebike');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('Good');
  const [location, setLocation] = useState('Baca Grande — Chalets I');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  // Optional E-Bike specs
  const [brand, setBrand] = useState('');
  const [motorWatts, setMotorWatts] = useState('');
  const [batterySpec, setBatterySpec] = useState('');
  const [rangeEstimate, setRangeEstimate] = useState('');

  // Seller details (email is prefilled from the signed-in account)
  const [sellerName, setSellerName] = useState(currentUser?.name || '');
  const [sellerEmail, setSellerEmail] = useState(currentUser?.email || '');
  const [sellerPhone, setSellerPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<PreferredContact>('Text or Email');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.email) {
      setSellerEmail((prev) => prev || currentUser.email);
    }
  }, [currentUser]);

  const previews = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  if (!isOpen) return null;

  const addPhotos = (fileList: FileList | null) => {
    if (!fileList) return;
    const images = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    setPhotos((prev) => [...prev, ...images].slice(0, MAX_PHOTOS));
    setError(null);
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setPhotos([]);
    setBrand('');
    setMotorWatts('');
    setBatterySpec('');
    setRangeEstimate('');
    setSellerPhone('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;
    if (photos.length === 0) {
      setError('Please add at least one photo.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmitListing(
        {
          title: title.trim(),
          category,
          price: Number(price),
          condition,
          location: location.trim() || 'Crestone / Baca Grande',
          description: description.trim(),
          brand: brand.trim() || undefined,
          motor_watts: motorWatts.trim() || undefined,
          battery_spec: batterySpec.trim() || undefined,
          range_estimate: rangeEstimate.trim() || undefined,
          seller_name: sellerName.trim() || 'Crestone Neighbor',
          seller_email: sellerEmail.trim() || currentUser?.email || '',
          seller_phone: sellerPhone.trim() || undefined,
          preferred_contact: preferredContact,
        },
        photos
      );
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish your listing.');
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
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {currentUser && (
            <p className="text-xs text-stone-500">
              Signed in as <strong className="text-stone-800">{currentUser.email}</strong>. You can
              mark your listing sold or delete it any time.
            </p>
          )}

          {/* Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Listing Title *
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={120}
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
                max="100000"
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
                maxLength={120}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Town of Crestone / Chalets"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          {/* E-Bike Specs */}
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
              maxLength={4000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell neighbors about the bike, tire sealant, included chargers/racks, or any quirks..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-700"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Photos * <span className="normal-case font-medium text-stone-500">(up to {MAX_PHOTOS}; the first is the cover)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {previews.map((url, idx) => (
                <div
                  key={url}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 bg-stone-100"
                >
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 text-[10px] font-bold text-center bg-stone-950/70 text-white py-0.5">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-stone-950/75 text-white hover:bg-rose-600 cursor-pointer"
                    aria-label={`Remove photo ${idx + 1}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-700 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-1 text-stone-500 hover:text-emerald-800 text-xs font-semibold cursor-pointer transition-colors">
                  <ImagePlus className="w-5 h-5" />
                  <span>Add photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addPhotos(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Seller Contact Info */}
          <div className="pt-2 border-t border-stone-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Your Contact Details
            </span>
            <p className="text-xs text-stone-500 -mt-1">
              Not shown on the listing. Buyers see them only after tapping “Show contact info”.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                maxLength={80}
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
                maxLength={40}
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="Phone (Optional)"
                className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
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

          {error && (
            <p className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 font-medium">
              {error}
            </p>
          )}

          {/* Submit + Optional Donation Nudge */}
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>{submitting ? 'Publishing...' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
