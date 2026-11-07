import React from 'react';
import {
  MapPin,
  ShieldCheck,
  Zap,
  BatteryCharging,
  Gauge,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { Listing } from '../types/listing';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
}

const CATEGORY_LABELS: Record<Listing['category'], { label: string; color: string }> = {
  ebike: { label: 'E-Bike', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  battery: { label: 'Battery & Power', color: 'bg-amber-100 text-amber-950 border-amber-300' },
  parts: { label: 'Parts & Tires', color: 'bg-sky-100 text-sky-900 border-sky-300' },
  accessories: { label: 'Gear & Trailers', color: 'bg-purple-100 text-purple-900 border-purple-300' },
};

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect }) => {
  const categoryBadge = CATEGORY_LABELS[listing.category];
  const isSold = listing.status === 'sold';

  return (
    <article
      onClick={() => onSelect(listing)}
      className={`group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-700/40 transition-all flex flex-col cursor-pointer ${
        isSold ? 'opacity-75' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative h-56 bg-stone-200 overflow-hidden">
        <img
          src={listing.image_url}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs ${categoryBadge.color}`}
          >
            {categoryBadge.label}
          </span>

          {listing.wade_inspected && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-900/95 text-amber-300 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              Wade Inspected
            </span>
          )}
        </div>

        {/* Price Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-baseline px-3.5 py-1.5 rounded-xl bg-stone-950/90 text-white font-serif-display font-bold text-xl shadow-md backdrop-blur-xs">
            ${listing.price.toLocaleString()}
          </span>
        </div>

        {/* Condition or Sold Overlay */}
        <div className="absolute bottom-3 right-3">
          {isSold ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sold
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-white/95 text-stone-800 text-xs font-semibold shadow-xs">
              {listing.condition}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          <h3 className="font-serif-display text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
            {listing.title}
          </h3>

          <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>

          {/* Specs Chips */}
          {(listing.motor_watts || listing.battery_spec || listing.range_estimate) && (
            <div className="pt-1 flex flex-wrap gap-1.5">
              {listing.motor_watts && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-medium">
                  <Zap className="w-3 h-3 text-amber-600" />
                  {listing.motor_watts}
                </span>
              )}
              {listing.battery_spec && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-medium">
                  <BatteryCharging className="w-3 h-3 text-emerald-700" />
                  {listing.battery_spec}
                </span>
              )}
              {listing.range_estimate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-medium">
                  <Gauge className="w-3 h-3 text-sky-700" />
                  {listing.range_estimate}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Seller & Contact CTA */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="text-xs text-stone-500">
            Posted by <strong className="text-stone-800">{listing.seller_name}</strong>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 group-hover:text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact Seller</span>
          </span>
        </div>
      </div>
    </article>
  );
};

