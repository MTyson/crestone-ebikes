import React from 'react';
import { Bike, Heart, PlusCircle, ShieldCheck, MessageSquare } from 'lucide-react';

interface FooterProps {
  onOpenPostModal: () => void;
  onOpenDonateModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPostModal, onOpenDonateModal }) => {
  return (
    <>
      {/* How It Works Community Section */}
      <section id="how-it-works" className="py-16 bg-stone-100 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Simple &amp; Local
            </span>
            <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
              How Crestone E-Bikes Works
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-2">
              No middleman fees or algorithms — just neighbors helping neighbors get around town and
              up into the foothills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                1. Post Your E-Bike or Gear for Free
              </h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                List a complete e-bike, a spare 48V/52V battery, fat tires, or cargo trailer in
                under two minutes. Sign in with a one-click email link to manage your post anytime.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                2. Optional Checkup at Wade’s Bench
              </h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                Want extra peace of mind? Bring the bike by Wade’s workshop in Crestone so he can
                load-test the battery and check the brakes for a “Wade Inspected” badge.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                3. Connect Directly &amp; Ride
              </h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                Text, call, or email the seller directly to take a test ride around Crestone or the
                Chalets. If you love the site, toss a few bucks into the shop coffee jar!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
              <span className="font-serif-display text-lg font-bold">crestoneebikes.com</span>
            </div>
            <p className="text-xs text-stone-400 max-w-md">
              “I just want to get people riding bikes!” — Wade’s local e-bike workshop &amp;
              community marketplace in Crestone, Colorado (San Luis Valley).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPostModal}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Post a Listing
            </button>
            <button
              onClick={onOpenDonateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Support the Shop / Donate</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};

