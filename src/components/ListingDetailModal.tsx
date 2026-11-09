import React, { useState } from 'react';
import {
  X,
  MapPin,
  ShieldCheck,
  Phone,
  Mail,
  Copy,
  Check,
  Zap,
  BatteryCharging,
  Gauge,
  Calendar,
  Tag,
  CheckCircle2,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { AppUser, Listing, ListingContact } from '../types/listing';
import { fetchListingContact } from '../services/listingsService';

interface ListingDetailModalProps {
  listing: Listing | null;
  currentUser: AppUser | null;
  onClose: () => void;
  onToggleSold: (listing: Listing) => Promise<void>;
  onDelete: (listing: Listing) => Promise<void>;
}

/**
 * Render with `key={listing.id}` so gallery / contact state resets per listing.
 */
export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  currentUser,
  onClose,
  onToggleSold,
  onDelete,
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [contact, setContact] = useState<ListingContact | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'phone' | 'email' | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!listing) return null;

  const images =
    listing.image_urls && listing.image_urls.length > 0 ? listing.image_urls : [listing.image_url];
  const isOwner = Boolean(currentUser && listing.user_id && listing.user_id === currentUser.id);
  const isApproved = Boolean(listing.ceb_approved);

  const revealContact = async () => {
    setContactLoading(true);
    setContactError(null);
    try {
      setContact(await fetchListingContact(listing));
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Could not load contact info.');
    } finally {
      setContactLoading(false);
    }
  };

  const copyText = (value: string, field: 'phone' | 'email') => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const runOwnerAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return;
    void runOwnerAction(() => onDelete(listing));
  };

  const formattedDate = new Date(listing.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>{listing.location}</span>
            <span>•</span>
            <Calendar className="w-3.5 h-3.5" />
            <span>Posted {formattedDate}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition-colors cursor-pointer"
            aria-label="Close listing details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Photo gallery */}
            <div className="md:col-span-6 space-y-2">
              <div className="relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                <img
                  src={images[Math.min(activeImage, images.length - 1)]}
                  alt={listing.title}
                  className="w-full h-64 sm:h-72 object-cover"
                />
                {listing.status === 'sold' && (
                  <div className="absolute inset-0 bg-stone-950/60 flex items-center justify-center">
                    <span className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold uppercase tracking-widest text-lg shadow-lg">
                      Sold
                    </span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((url, idx) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      aria-label={`Show photo ${idx + 1}`}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer ${
                        idx === activeImage ? 'border-emerald-700' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-bold">
                  Condition: {listing.condition}
                </span>
                {isApproved && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-900 text-amber-300 text-xs font-bold shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    CEB Approved
                  </span>
                )}
              </div>

              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                {listing.title}
              </h2>

              <div className="text-3xl font-serif-display font-bold text-emerald-800">
                ${listing.price.toLocaleString()}
              </div>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          </div>

          {/* CEB Approved Bench Report */}
          {isApproved && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950 text-emerald-50 border border-emerald-800 flex items-start gap-3.5">
              <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-serif-display font-bold text-amber-300 text-base">
                    Crestone E-Bike (CEB) Approved Report
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-700/60">
                    Bench Verified
                  </span>
                </div>
                <p className="text-sm text-emerald-100 mt-1 leading-relaxed">
                  {listing.inspection_note ||
                    'Checked on the shop repair bench in Crestone — battery load-tested, electrical diagnostics verified, and drivetrain inspected trail-ready.'}
                </p>
              </div>
            </div>
          )}

          {/* Specs Grid */}
          {(listing.brand ||
            listing.motor_watts ||
            listing.battery_spec ||
            listing.range_estimate ||
            listing.mileage ||
            listing.wheel_size) && (
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/90">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {listing.brand && (
                  <div>
                    <span className="text-xs text-stone-500 block">Brand / Build</span>
                    <span className="font-semibold text-stone-900 flex items-center gap-1.5 mt-0.5">
                      <Tag className="w-3.5 h-3.5 text-stone-500" />
                      {listing.brand}
                    </span>
                  </div>
                )}
                {listing.motor_watts && (
                  <div>
                    <span className="text-xs text-stone-500 block">Motor</span>
                    <span className="font-semibold text-stone-900 flex items-center gap-1.5 mt-0.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      {listing.motor_watts}
                    </span>
                  </div>
                )}
                {listing.battery_spec && (
                  <div>
                    <span className="text-xs text-stone-500 block">Battery</span>
                    <span className="font-semibold text-stone-900 flex items-center gap-1.5 mt-0.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-700" />
                      {listing.battery_spec}
                    </span>
                  </div>
                )}
                {listing.range_estimate && (
                  <div>
                    <span className="text-xs text-stone-500 block">Est. Range</span>
                    <span className="font-semibold text-stone-900 flex items-center gap-1.5 mt-0.5">
                      <Gauge className="w-3.5 h-3.5 text-sky-700" />
                      {listing.range_estimate}
                    </span>
                  </div>
                )}
                {listing.wheel_size && (
                  <div>
                    <span className="text-xs text-stone-500 block">Wheels / Tires</span>
                    <span className="font-semibold text-stone-900 block mt-0.5">
                      {listing.wheel_size}
                    </span>
                  </div>
                )}
                {listing.mileage && (
                  <div>
                    <span className="text-xs text-stone-500 block">Odometer</span>
                    <span className="font-semibold text-stone-900 block mt-0.5">
                      {listing.mileage}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Seller (click to reveal) */}
          <div className="p-6 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Contact Seller Directly
                </span>
                <h3 className="font-serif-display text-xl font-bold text-stone-900">
                  {listing.seller_name} — {listing.location}
                </h3>
              </div>
              {contact && (
                <span className="px-3 py-1 rounded-full bg-white text-stone-700 text-xs font-semibold border border-amber-300">
                  Prefers: {contact.preferred_contact}
                </span>
              )}
            </div>

            {!contact ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={revealContact}
                  disabled={contactLoading}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  {contactLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>{contactLoading ? 'Loading…' : 'Show contact info'}</span>
                </button>
                {contactError && (
                  <p className="text-xs text-rose-600 font-medium">{contactError}</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contact.seller_phone && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs text-stone-500 block">Phone / Text</span>
                        <a
                          href={`tel:${contact.seller_phone}`}
                          className="font-bold text-stone-900 hover:text-emerald-800 text-sm"
                        >
                          {contact.seller_phone}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => copyText(contact.seller_phone!, 'phone')}
                      className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'phone' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-stone-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-stone-500 block">Email</span>
                      <a
                        href={`mailto:${contact.seller_email}?subject=${encodeURIComponent(
                          `Crestone E-Bikes inquiry: ${listing.title}`
                        )}`}
                        className="font-bold text-stone-900 hover:text-emerald-800 text-sm truncate block"
                      >
                        {contact.seller_email}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => copyText(contact.seller_email, 'email')}
                    className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedField === 'email' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-stone-600">
              💡 <strong>Local Tip:</strong> You’re welcome to meet at the Crestone E-Bikes shop for
              a test ride or battery load check!
            </p>
          </div>

          {/* Owner-only controls */}
          {isOwner && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Your listing
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => runOwnerAction(() => onToggleSold(listing))}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-60 text-stone-800 text-sm font-semibold cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{listing.status === 'sold' ? 'Mark as Available Again' : 'Mark as Sold'}</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 disabled:opacity-60 text-rose-700 text-sm font-semibold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete listing</span>
                </button>
              </div>
              {actionError && <p className="text-xs text-rose-600 font-medium">{actionError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
