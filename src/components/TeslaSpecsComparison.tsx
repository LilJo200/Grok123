import React from 'react';
import { VEHICLE_MODELS } from '../data/teslaData';
import { convertUsdToCrypto } from '../data/cryptoRates';
import { VehicleModelId } from '../types/tesla';
import { ArrowRight, Check, Minus } from 'lucide-react';

interface TeslaSpecsComparisonProps {
  onSelectModel: (id: VehicleModelId) => void;
}

export const TeslaSpecsComparison: React.FC<TeslaSpecsComparisonProps> = ({
  onSelectModel,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-800/80">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
          Fleet Architecture
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          Vehicle Specifications Matrix
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Compare range, acceleration, powertrain architecture, and crypto exchange rates across the Tesla lineup.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#111216] shadow-xl">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 uppercase text-[11px] font-semibold tracking-wider">
              <th className="py-4 px-6">Model</th>
              <th className="py-4 px-4">0-60 mph</th>
              <th className="py-4 px-4">Est. Range</th>
              <th className="py-4 px-4">Top Speed</th>
              <th className="py-4 px-4">Horsepower</th>
              <th className="py-4 px-4">Starting USD</th>
              <th className="py-4 px-4">Est. BTC Equivalent</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 font-mono tabular-nums text-zinc-300">
            {VEHICLE_MODELS.map((model) => {
              const trim = model.trims[0];
              const btcPrice = convertUsdToCrypto(trim?.basePrice || 0, 'BTC');

              return (
                <tr
                  key={model.id}
                  className="hover:bg-zinc-800/40 transition-colors group"
                >
                  <td className="py-4 px-6 font-sans font-bold text-white flex items-center gap-2">
                    <span>{model.name}</span>
                    <span className="text-[10px] text-zinc-500 font-normal">({model.category})</span>
                  </td>
                  <td className="py-4 px-4 text-emerald-400 font-semibold">
                    {trim?.acceleration0to60}s
                  </td>
                  <td className="py-4 px-4">{trim?.rangeMiles} mi</td>
                  <td className="py-4 px-4">{trim?.topSpeedMph} mph</td>
                  <td className="py-4 px-4">{trim?.peakHorsepower} hp</td>
                  <td className="py-4 px-4 font-semibold text-white">
                    ${trim?.basePrice.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-amber-400 font-semibold">
                    {btcPrice} BTC
                  </td>
                  <td className="py-4 px-6 text-right font-sans">
                    <button
                      type="button"
                      onClick={() => onSelectModel(model.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-white hover:text-zinc-950 text-zinc-200 text-xs font-semibold transition-all inline-flex items-center gap-1"
                    >
                      <span>Configure</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
