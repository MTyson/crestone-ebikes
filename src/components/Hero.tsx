import React from 'react';
import { ArrowDownRight, PlusCircle, ShieldCheck, Wrench, Mountain, Heart } from 'lucide-react';

interface HeroProps {
  totalActiveCount: number;
  cebApprovedCount: number;
  onOpenPostModal: () => void;
  onOpenDonateModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  totalActiveCount,
  cebApprovedCount,
  onOpenPostModal,
  onOpenDonateModal,
}) => {
  const renderWadeCard = () => (
    <div className="relative rounded-3xl overflow-hidden bg-stone-900 shadow-xl ring-1 ring-stone-900/10 group">
      <img
        src="/images/wade-hero-front.jpg"
        alt="Wade smiling proudly beside the hand-carved e-Bike Crestone wooden sign outside his shop"
        className="w-full h-[360px] sm:h-[440px] lg:h-[490px] object-cover object-[center_20%] group-hover:scale-[1.02] transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-300/95 text-stone-950 shadow-sm">
          📍 Wade &amp; "e-Bike Crestone"
        </span>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white">
        <p className="text-xs uppercase tracking-wider text-amber-300 font-bold mb-1">
          Meet the Owner &amp; Mechanic
        </p>
        <p className="font-serif-display text-xl sm:text-2xl font-bold leading-snug">
          Wade in front of his shop in the Baca
        </p>
        <p className="text-xs sm:text-sm text-stone-200 mt-1">
          Have an e-bike you want checked before buying or selling? Connect with Wade to schedule
          a checkup or tune-up.
        </p>
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-stone-50 to-stone-50 pt-8 pb-16 lg:pt-14 lg:pb-22 border-b border-stone-200/80">
      {/* Subtle Decorative Mountain Lines */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Mission, Quote & CTA */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Location & Title with Breathing Room */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold uppercase tracking-widest text-emerald-800">
                <Mountain className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>Crestone &amp; The Sangre de Cristo Foothills</span>
              </div>

              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-[1.08] pt-1">
                Keep Crestone{' '}
                <span className="text-emerald-800 underline decoration-amber-400/80 decoration-wavy decoration-2 underline-offset-8">
                  Wheeled.
                </span>
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl">
              The neighborhood trading post and information source for buying and selling used
              e-bikes, parts, and accessories, plus questions and comments, in Crestone &amp; the
              Baca Grande — backed by local mechanic{' '}
              <strong className="text-stone-900">Wade’s workshop</strong>.
            </p>

            {/* Prominent Front & Center on Mobile: Photo of Wade appears right here */}
            <div className="lg:hidden pt-1 pb-1">
              {renderWadeCard()}
            </div>

            {/* Wade's Signature Quote Card */}
            <blockquote className="relative p-5 sm:p-6 rounded-2xl bg-white border-l-4 border-amber-500 shadow-sm ring-1 ring-stone-200/80">
              <p className="font-serif-display italic text-xl sm:text-2xl text-stone-900 font-medium">
                “I just want to get people riding bikes!”
              </p>
              <footer className="mt-2 flex items-center justify-between text-xs sm:text-sm text-stone-600">
                <span>
                  — <strong className="text-stone-900">Wade</strong>, Owner &amp; E-Bike Mechanic at Crestone E-Bike
                </span>
                <a
                  href="#wade-workshop"
                  className="text-emerald-800 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  Explore Wade’s repair services &rarr;
                </a>
              </footer>
            </blockquote>

            {/* Action Buttons: Solid Primary vs. Ghost/Outline Secondary */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="#marketplace"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-base shadow-sm transition-all"
              >
                <span>Browse Bikes &amp; Gear ({totalActiveCount})</span>
                <ArrowDownRight className="w-5 h-5" />
              </a>

              <button
                onClick={onOpenPostModal}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-transparent hover:bg-stone-200/50 text-stone-900 font-semibold text-base border-2 border-stone-800/80 hover:border-stone-900 transition-all cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-emerald-800" />
                <span>Post Your E-Bike or Gear (Free)</span>
              </button>
            </div>

            {/* Trust / Quick Stats with increased vertical whitespace */}
            <div className="pt-8 sm:pt-10 mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-stone-200/90 text-xs sm:text-sm text-stone-600">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block">
                    {cebApprovedCount} CEB Approved
                  </span>
                  Brakes, wiring &amp; safety checked
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Wrench className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block">Local Repair Bench</span>
                  Tune-ups, wiring &amp; assembly
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Heart className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block">Community Supported</span>
                  <button
                    onClick={onOpenDonateModal}
                    className="text-emerald-800 font-semibold hover:underline text-left cursor-pointer"
                  >
                    Optional tip jar &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Wade in front of his e-bike shop (Desktop only) */}
          <div className="hidden lg:block lg:col-span-5">
            {renderWadeCard()}
          </div>
        </div>
      </div>
    </section>
  );
};

