import React, { useState } from 'react';
import { VehicleModelId } from '../types/tesla';
import { VEHICLE_MODELS } from '../data/teslaData';
import { ArrowRight, Coins, ShieldCheck, Zap } from 'lucide-react';

interface HeroFleetProps {
  selectedModelId: VehicleModelId;
  onSelectModel: (id: VehicleModelId) => void;
  onConfigureClick: () => void;
  onOpenTestDrive: () => void;
  onOrderCryptoClick: () => void;
}

export const HeroFleet: React.FC<HeroFleetProps> = ({
  selectedModelId,
  onSelectModel,
  onConfigureClick,
  onOpenTestDrive,
  onOrderCryptoClick,
}) => {
  const currentModel = VEHICLE_MODELS.find((m) => m.id === selectedModelId) || VEHICLE_MODELS[0];
  const primaryTrim = currentModel.trims[0];

  return (
    <section id="hero" className="relative w-full min-h-[85vh] flex flex-col justify-between overflow-hidden border-b border-zinc-800">
      {/* Background Cinematic Vehicle Image with subtle gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentModel.heroImage}
          alt={`Tesla ${currentModel.name} presentation`}
          className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0f] via-[#0c0d0f]/50 to-black/40" />
      </div>

      {/* Top Hero Brand & Vehicle Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 text-center w-full">
        <span className="text-xs font-semibold tracking-widest text-zinc-300 uppercase font-mono block mb-2">
          The Future of Electric Propulsion
        </span>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto [text-wrap:balance]">
          {currentModel.name}
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto mt-3 [text-wrap:balance]">
          {currentModel.headline}. {currentModel.description}
        </p>

        {/* Model Selector Bar */}
        <div className="mt-8 flex items-center justify-center gap-2 overflow-x-auto py-2">
          {VEHICLE_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectModel(m.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap backdrop-blur-md border ${
                m.id === currentModel.id
                  ? 'bg-white text-zinc-950 border-white shadow-lg font-bold'
                  : 'bg-black/40 text-zinc-300 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Hero KPIs & Action Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-8">
          {/* 3 Core Performance Specs */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 text-center text-white">
            <div>
              <div className="text-2xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight">
                {primaryTrim?.acceleration0to60}s
              </div>
              <span className="text-xs text-zinc-400 mt-1 block uppercase tracking-wider">
                0-60 mph
              </span>
            </div>

            <div className="border-x border-zinc-700/60 px-4 sm:px-10">
              <div className="text-2xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight">
                {primaryTrim?.rangeMiles} mi
              </div>
              <span className="text-xs text-zinc-400 mt-1 block uppercase tracking-wider">
                Est. Range
              </span>
            </div>

            <div>
              <div className="text-2xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight">
                {primaryTrim?.topSpeedMph} mph
              </div>
              <span className="text-xs text-zinc-400 mt-1 block uppercase tracking-wider">
                Top Speed
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap justify-center">
            <button
              type="button"
              onClick={onConfigureClick}
              className="py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-zinc-200 text-zinc-950 transition-all flex items-center justify-center gap-2 shadow-xl whitespace-nowrap"
            >
              <span>Custom Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOrderCryptoClick}
              className="py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-zinc-900/90 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 backdrop-blur-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Pay with Crypto (BTC/ETH)</span>
            </button>

            <button
              type="button"
              onClick={onOpenTestDrive}
              className="py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm bg-black/40 hover:bg-black/60 text-zinc-300 border border-white/20 backdrop-blur-md transition-all whitespace-nowrap"
            >
              Demo Drive
            </button>
          </div>
        </div>

        {/* Clean Subtext */}
        <div className="mt-6 text-center text-xs text-zinc-400 flex items-center justify-center gap-4 flex-wrap">
          <span>Starting at ${primaryTrim?.basePrice.toLocaleString()}</span>
          <span className="text-zinc-600">·</span>
          <span>Delivery in {currentModel.deliveryEstimateWeeks}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-emerald-400">Bitcoin & Ethereum Accepted</span>
        </div>
      </div>
    </section>
  );
};
