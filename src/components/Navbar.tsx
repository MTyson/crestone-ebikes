import React from 'react';
import { Bike, Heart, PlusCircle, Wrench, UserCheck, LogIn, LogOut, Sparkles } from 'lucide-react';
import { AppUser } from '../types/listing';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentUser: AppUser | null;
  onOpenPostModal: () => void;
  onOpenDonateModal: () => void;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenPostModal,
  onOpenDonateModal,
  onOpenAuthModal,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
      {/* Condensed Top Accent Banner */}
      <div className="bg-emerald-950 text-emerald-100 text-[11px] sm:text-xs py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Crestone Local Board</strong> — Free community e-bike &amp; gear listings
            </span>
          </span>
          <span className="text-emerald-300/80 text-[11px] shrink-0 hidden md:inline">
            {isSupabaseConfigured
              ? 'Connected to Supabase Live DB'
              : 'Interactive Prototype • Supabase & Magic Link Ready'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center shadow-sm group-hover:bg-emerald-800 transition-colors shrink-0">
            <Bike className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-serif-display text-lg sm:text-2xl font-bold tracking-tight text-stone-900 leading-snug">
              Crestone E-Bike
            </span>
            <span className="hidden sm:block text-xs text-stone-500 font-medium tracking-wide">
              CRESTONE &amp; BACA GRANDE, CO
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-700">
          <a href="#marketplace" className="hover:text-emerald-800 transition-colors">
            Bikes &amp; Gear For Sale
          </a>
          <a
            href="#wade-workshop"
            className="hover:text-emerald-800 transition-colors flex items-center gap-1.5"
          >
            <Wrench className="w-4 h-4 text-amber-600" />
            Meet Wade &amp; Repairs
          </a>
          <a href="#how-it-works" className="hover:text-emerald-800 transition-colors">
            How It Works
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenDonateModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-amber-950 bg-amber-200/80 hover:bg-amber-300/90 border border-amber-300/80 transition-colors cursor-pointer shrink-0"
            title="Donate to keep Crestone E-Bike free for the community"
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 fill-amber-600" />
            <span>Donate</span>
          </button>

          <button
            onClick={onOpenPostModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 hover:text-emerald-800 hover:bg-stone-200/50 transition-colors cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800" />
            <span className="hidden sm:inline">Post Bike / Gear</span>
            <span className="sm:hidden">Post</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-0.5 sm:pl-1">
              <span
                className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium bg-stone-200/80 text-stone-800 px-3 py-1.5 rounded-lg"
                title={currentUser.email}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                {currentUser.email.split('@')[0]}
              </span>
              <button
                onClick={onSignOut}
                className="p-1.5 sm:p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
              title="Sign in with email magic link"
            >
              <LogIn className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

