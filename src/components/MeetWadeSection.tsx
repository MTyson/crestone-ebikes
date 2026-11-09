import React from 'react';
import {
  Wrench,
  BatteryCharging,
  Cpu,
  Disc,
  Compass,
  Video,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';

export const MeetWadeSection: React.FC = () => {
  const repairHighlights = [
    {
      icon: <BatteryCharging className="w-5 h-5 text-amber-400" />,
      title: 'Battery Diagnostics & Load Testing',
      description:
        'A battery that reads 54V on a charger can still sag under load on a hill. Wade tests packs under real current draw, checks BMS health, balances cells, and replaces melted or dusty discharge connectors with reliable XT60/XT90 leads.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      title: 'Motors, Controllers & Wiring Rescue',
      description:
        'From Bafang mid-drive conversions and planetary gear regreasing to troubleshooting hall sensor errors, broken throttles, and chewed or pinched wiring harnesses.',
    },
    {
      icon: <Disc className="w-5 h-5 text-sky-400" />,
      title: 'Brakes & Drivetrain for Heavy E-Bikes',
      description:
        'A 70-pound e-bike coming down from the foothills needs real stopping power. Wade bleeds hydraulic disc brakes, upgrades rotors, aligns derailleurs, and trues heavy hub-motor wheels.',
    },
    {
      icon: <Compass className="w-5 h-5 text-rose-400" />,
      title: 'Crestone Dirt, Sand & Goathead Proofing',
      description:
        'Setups dialed specifically for Baca Grande washboard roads and sand patches — fat-tire sealant, heavy-duty liners, suspension seatposts, and dust-sealed electrical connections.',
    },
  ];

  return (
    <section
      id="wade-workshop"
      className="py-20 bg-stone-900 text-stone-100 border-y border-stone-800 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header + Quote */}
        <div className="max-w-3xl mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5" />
            Inside the Workshop
          </span>

          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            “I just want to get people riding bikes!”
          </h2>

          <p className="text-stone-300 text-lg mt-4 leading-relaxed">
            Around Crestone, an e-bike isn’t just a toy — it’s how neighbors run errands to the
            Mercantile, visit friends across the Chalets, and explore the foothills without burning
            gas. When mail-order e-bike companies won’t answer the phone or local bike shops turn
            away electric motors, <strong className="text-white">Wade gets them back on the road.</strong>
          </p>
        </div>

        {/* Two-Photo Showcase: Shop Front + Inside the Workshop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-14">
          {/* Workshop Action Photo (Large) */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 flex flex-col">
            <div className="relative h-80 sm:h-96 overflow-hidden">
              <img
                src="/images/wade-workshop.jpg"
                alt="Wade inside his Crestone e-bike workshop leaning on his workbench surrounded by bikes, parts, and tools"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-950/85 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
                  🔧 Inside Wade’s Workshop &amp; Repair Bench
                </span>
              </div>
            </div>
            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-stone-950/60">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-600/40 text-emerald-300 text-xs font-semibold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>LEVA-Certified Light Electric Vehicle Technician</span>
                </div>
                <h3 className="font-serif-display text-2xl font-bold text-white">
                  Real Diagnostics — Mechanical &amp; Electrical
                </h3>
                <p className="text-stone-300 text-sm sm:text-base mt-2 leading-relaxed">
                  Most e-bike problems come down to a mystery error code, a loose phase-wire pin, a
                  worn brake sensor, or a tired battery cell group. Trained in classic Sutherland bicycle
                  mechanics and certified by the Light Electric Vehicle Association (LEVA), Wade puts
                  your bike on the stand, hooks up the multimeter and load tester, and finds out what’s
                  actually going on.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-stone-800/80 flex flex-wrap items-center gap-4 text-xs text-stone-400">
                <span className="inline-flex items-center gap-1.5 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> LEVA-Certified diagnostics &amp; wiring
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Pre-purchase inspections for buyers &amp; sellers
                </span>
                <span className="inline-flex items-center gap-1.5 text-sky-300 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Custom mid-drive &amp; hub conversions
                </span>
              </div>
            </div>
          </div>

          {/* Second Photo: Wade Outside the Shop + Video Interview Back-Burner Card */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 flex-1 flex flex-col">
              <div className="relative h-64 sm:h-72 overflow-hidden">
                <img
                  src="/images/wade-shop-face.jpg"
                  alt="Wade smiling proudly beside the hand-carved e-Bike Crestone wooden sign outside his shop"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-950/85 text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
                    🏔️ Wade with his "e-Bike Crestone" Sign
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif-display text-xl font-bold text-white">
                  Get the “Wade Inspected” Badge on Your Listing
                </h3>
                <p className="text-sm text-stone-300 mt-1.5 leading-relaxed">
                  Selling your bike on Crestone E-Bike? Connect with Wade to schedule a quick safety
                  and battery checkup so buyers know the battery holds a real charge and the brakes
                  are trail-ready.
                </p>
              </div>
            </div>

            {/* Back-burner Video Interview Placeholder Card */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-stone-800/90 to-stone-900 border border-amber-400/30 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 mb-1.5">
                    Coming Soon • Shop Video Feature
                  </span>
                  <h4 className="font-serif-display text-lg font-bold text-white">
                    Short Video Interview with Wade
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                    We’re planning a short shop-talk video with Wade showing how he diagnoses
                    batteries, converts mountain bikes for Crestone’s sandy roads, and keeps local
                    bikes rolling. Stay tuned!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How Wade Fixes Bikes — 4 Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {repairHighlights.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-stone-950/70 border border-stone-800 hover:border-stone-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h4 className="font-serif-display text-lg font-bold text-white">{item.title}</h4>
              <p className="text-sm text-stone-400 mt-2 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Shop Contact Strip */}
        <div className="mt-10 p-6 rounded-2xl bg-emerald-950/70 border border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-serif-display text-lg font-bold text-white">
              Need an e-bike tune-up, battery test, or conversion consult?
            </h4>
            <p className="text-sm text-emerald-200/90 mt-0.5">
              Call or text Wade directly at <strong className="text-white">(719) 588-9246</strong> to schedule an appointment.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="tel:7195889246"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm transition-colors cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call (719) 588-9246</span>
            </a>
            <a
              href="sms:7195889246"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-400/40 font-bold text-sm transition-colors cursor-pointer"
            >
              <span>Text Wade</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

