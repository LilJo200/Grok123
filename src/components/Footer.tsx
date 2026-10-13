import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800 bg-[#090a0d] text-zinc-500 py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="font-mono tracking-[0.25em] font-bold text-sm text-zinc-300 block">
              T E S L A
            </span>
            <p className="text-zinc-500 mt-1 max-w-md text-[11px]">
              Accelerating the world's transition to sustainable energy through electric vehicles, solar roofs, and seamless digital currency settlement.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[12px] text-zinc-400">
            <a href="#hero" className="hover:text-white transition-colors">Model S</a>
            <a href="#hero" className="hover:text-white transition-colors">Model 3</a>
            <a href="#hero" className="hover:text-white transition-colors">Model X</a>
            <a href="#hero" className="hover:text-white transition-colors">Model Y</a>
            <a href="#hero" className="hover:text-white transition-colors">Cybertruck</a>
            <a href="#inventory" className="hover:text-white transition-colors">Inventory</a>
            <a href="#configurator" className="hover:text-white transition-colors">Crypto Payments</a>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
          <div>
            Tesla, Inc. © {new Date().getFullYear()} · All Rights Reserved
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy & Legal</span>
            <span>·</span>
            <span className="hover:text-zinc-400 cursor-pointer">Vehicle Recalls</span>
            <span>·</span>
            <span className="hover:text-zinc-400 cursor-pointer">Contact</span>
            <span>·</span>
            <span className="hover:text-zinc-400 cursor-pointer">Locations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
