import React, { useState } from 'react';
import { INVENTORY_VEHICLES } from '../data/teslaData';
import { SUPPORTED_CRYPTO_CURRENCIES, convertUsdToCrypto } from '../data/cryptoRates';
import { CryptoCurrencyCode } from '../types/tesla';
import {
  Car,
  Zap,
  MapPin,
  Clock,
  Coins,
  ShieldCheck,
  Check,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface InventoryViewProps {
  onSelectVehicleForCheckout: (invVehicle: typeof INVENTORY_VEHICLES[0], cryptoCode?: CryptoCurrencyCode) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onSelectVehicleForCheckout,
}) => {
  const [filterModel, setFilterModel] = useState<string>('all');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrencyCode>('BTC');

  const filteredVehicles =
    filterModel === 'all'
      ? INVENTORY_VEHICLES
      : INVENTORY_VEHICLES.filter((v) => v.modelId === filterModel);

  return (
    <section id="inventory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Ready for Delivery
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            New & Pre-Configured Inventory
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Vehicles pre-built and staged at regional delivery hubs. Take delivery in as little as 24-48 hours with instant cryptocurrency or cash settlement.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setFilterModel('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterModel === 'all'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Models
            </button>
            <button
              type="button"
              onClick={() => setFilterModel('models')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterModel === 'models'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Model S
            </button>
            <button
              type="button"
              onClick={() => setFilterModel('model3')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterModel === 'model3'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Model 3
            </button>
            <button
              type="button"
              onClick={() => setFilterModel('modely')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterModel === 'modely'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Model Y
            </button>
            <button
              type="button"
              onClick={() => setFilterModel('cybertruck')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterModel === 'cybertruck'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cybertruck
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredVehicles.map((vehicle) => {
          const cryptoAmount = convertUsdToCrypto(vehicle.finalPrice, selectedCrypto);

          return (
            <div
              key={vehicle.id}
              className="bg-[#111216] border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Image slot */}
                <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={vehicle.modelName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                    Save ${vehicle.inventoryDiscount.toLocaleString()}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-zinc-300">
                    Odometer: {vehicle.odometer} mi
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {vehicle.modelName}
                    </h3>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {vehicle.exteriorColor} · {vehicle.wheels}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-400 border-t border-zinc-800/80 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{vehicle.deliveryWindow}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{vehicle.location}</span>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-zinc-500 line-through mr-1.5 font-mono">
                          ${vehicle.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xl font-bold font-mono text-white">
                          ${vehicle.finalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 mt-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        ≈ {cryptoAmount} {selectedCrypto}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => onSelectVehicleForCheckout(vehicle, selectedCrypto)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white hover:bg-zinc-200 text-zinc-950 transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Purchase Ready Vehicle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
