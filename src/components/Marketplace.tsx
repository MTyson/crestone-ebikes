import React, { useState, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  SlidersHorizontal,
  PlusCircle,
  Bike,
  BatteryCharging,
  Wrench,
  Package,
} from 'lucide-react';
import { Listing, ListingCategory } from '../types/listing';
import { ListingCard } from './ListingCard';

interface MarketplaceProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onOpenPostModal: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  listings,
  onSelectListing,
  onOpenPostModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ListingCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyCebApproved, setOnlyCebApproved] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
        if (onlyCebApproved && !(item.ceb_approved ?? item.wade_inspected)) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchLocation = item.location.toLowerCase().includes(q);
          const matchBrand = item.brand?.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchLocation || matchBrand;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [listings, selectedCategory, searchQuery, onlyCebApproved, sortBy]);

  const categories: {
    id: 'all' | ListingCategory;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'all', label: 'All Listings', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'ebike', label: 'E-Bikes', icon: <Bike className="w-4 h-4" /> },
    { id: 'battery', label: 'Batteries & Chargers', icon: <BatteryCharging className="w-4 h-4" /> },
    { id: 'parts', label: 'Parts & Fat Tires', icon: <Wrench className="w-4 h-4" /> },
    { id: 'accessories', label: 'Trailers & Gear', icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <section id="marketplace" className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
            Community Classifieds
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Local E-Bikes &amp; Gear For Sale
          </h2>
          <p className="text-stone-600 mt-1.5 max-w-2xl">
            Every listing is right here in Crestone, the Baca Grande, or the San Luis Valley. Click
            any listing to see specs and contact your neighbor directly.
          </p>
        </div>

        <button
          onClick={onOpenPostModal}
          className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Your E-Bike or Part</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-4 mb-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search + Wade Inspected Toggle + Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-stone-100">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand (Rad, Aventon, Bafang), tire size, or Chalets..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
            />
          </div>

          <div className="md:col-span-3 flex items-center">
            <label className="inline-flex items-center gap-2.5 text-sm font-medium text-stone-700 cursor-pointer select-none px-3 py-2 rounded-xl hover:bg-stone-50 w-full border border-stone-200/80" title="Crestone E-Bike Approved">
              <input
                type="checkbox"
                checked={onlyCebApproved}
                onChange={(e) => setOnlyCebApproved(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-800"
              />
              <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
              <span className="truncate">CEB Approved Only</span>
            </label>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort listings"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 font-medium focus:outline-none focus:border-emerald-700"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-stone-300">
          <Bike className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="font-serif-display text-xl font-bold text-stone-800">
            No matching bikes or gear found
          </h3>
          <p className="text-sm text-stone-600 mt-1 max-w-md mx-auto">
            Try clearing your search filters, or be the first to post an e-bike or spare part in
            this category!
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setOnlyCebApproved(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onSelect={onSelectListing} />
          ))}
        </div>
      )}
    </section>
  );
};

