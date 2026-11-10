import React, { useState } from 'react';
import { X, Heart, Coffee, Wrench, Bike, CheckCircle2 } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [thankYouShown, setThankYouShown] = useState(false);

  if (!isOpen) return null;

  const tiers = [
    {
      amount: 5,
      label: 'Shop Coffee',
      desc: 'Fuels early morning wrenching on Wade’s bench',
      icon: <Coffee className="w-4 h-4 text-amber-700" />,
    },
    {
      amount: 10,
      label: 'Tube & Sealant Jar',
      desc: 'Helps keep hosting & spare goathead patches free for neighbors',
      icon: <Wrench className="w-4 h-4 text-emerald-700" />,
    },
    {
      amount: 25,
      label: 'Sold a Bike Tip!',
      desc: 'Sold your e-bike on the site? Pay it forward to keep Crestone rolling',
      icon: <Bike className="w-4 h-4 text-sky-700" />,
    },
  ];

  const handleSimulateDonate = () => {
    const customUrl = import.meta.env.VITE_DONATION_URL as string | undefined;
    if (customUrl) {
      window.open(customUrl, '_blank', 'noopener,noreferrer');
    }
    setThankYouShown(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-bold">
            <Heart className="w-3.5 h-3.5 text-amber-700 fill-amber-600" />
            Community Tip Jar
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
          Keep Crestone E-Bike Free for Everyone
        </h2>
        <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
          We keep posting and browsing 100% free so every neighbor in Crestone and the Baca can find
          reliable electric wheels. If this site helped you buy or sell a bike, consider tossing a
          few bucks into Wade’s shop coffee &amp; hosting jar!
        </p>

        {thankYouShown ? (
          <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h3 className="font-serif-display text-xl font-bold text-stone-900">
              Thank you, neighbor!
            </h3>
            <p className="text-sm text-stone-600">
              Your ${selectedAmount} contribution helps cover crestoneebike.com hosting and keeps
              Wade’s community repair bench humming.
            </p>
            <button
              onClick={() => {
                setThankYouShown(false);
                onClose();
              }}
              className="mt-2 px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold cursor-pointer"
            >
              Back to Bikes
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {tiers.map((tier) => {
              const active = selectedAmount === tier.amount;
              return (
                <button
                  key={tier.amount}
                  type="button"
                  onClick={() => setSelectedAmount(tier.amount)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                    active
                      ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                      {tier.icon}
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">{tier.label}</div>
                      <div className="text-xs text-stone-600 mt-0.5">{tier.desc}</div>
                    </div>
                  </div>
                  <span className="font-serif-display text-xl font-bold text-stone-900 shrink-0">
                    ${tier.amount}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleSimulateDonate}
              className="w-full mt-2 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              Contribute ${selectedAmount} to Crestone E-Bike
            </button>

            <p className="text-[11px] text-center text-stone-500 pt-1">
              Ready to hook up to Stripe Payment Links, BuyMeACoffee, or Venmo via{' '}
              <code>VITE_DONATION_URL</code> — or just drop cash in the jar at Wade’s bench!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

