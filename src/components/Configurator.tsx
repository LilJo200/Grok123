import React, { useState } from 'react';
import {
  VehicleModel,
  ConfigurationState,
  VehicleModelId,
  PaymentMethod,
  CryptoCurrencyCode,
} from '../types/tesla';
import {
  VEHICLE_MODELS,
  FULL_SELF_DRIVING_PRICE,
  ENHANCED_AUTOPILOT_PRICE,
  TOW_HITCH_PRICE,
  WALL_CONNECTOR_PRICE,
  MOBILE_CONNECTOR_PRICE,
} from '../data/teslaData';
import { VehicleCanvas } from './VehicleCanvas';
import { PaymentCalculator } from './PaymentCalculator';
import {
  Check,
  Zap,
  Gauge,
  Battery,
  Shield,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Compass,
} from 'lucide-react';

interface ConfiguratorProps {
  selectedModelId: VehicleModelId;
  onSelectModelId: (id: VehicleModelId) => void;
  onInitiateOrder: (config: ConfigurationState, paymentMethod: PaymentMethod, cryptoCode?: CryptoCurrencyCode) => void;
  onOpenTestDrive: (modelId: VehicleModelId) => void;
}

export const Configurator: React.FC<ConfiguratorProps> = ({
  selectedModelId,
  onSelectModelId,
  onInitiateOrder,
  onOpenTestDrive,
}) => {
  const currentModel = VEHICLE_MODELS.find((m) => m.id === selectedModelId) || VEHICLE_MODELS[0];

  // Config State initialized to current model defaults
  const [config, setConfig] = useState<ConfigurationState>({
    modelId: currentModel.id,
    trimId: currentModel.trims[0]?.id || '',
    paintId: currentModel.paints[0]?.id || '',
    wheelId: currentModel.wheels[0]?.id || '',
    interiorId: currentModel.interiors[0]?.id || '',
    steeringType: 'round',
    fullSelfDriving: true,
    enhancedAutopilot: false,
    towHitch: false,
    wallConnector: false,
    mobileConnector: false,
  });

  const [canvasAngle, setCanvasAngle] = useState<'front' | 'side' | 'rear' | 'interior' | 'cinematic'>('front');

  // When model changes from outside
  const handleModelSelect = (newModelId: VehicleModelId) => {
    onSelectModelId(newModelId);
    const targetModel = VEHICLE_MODELS.find((m) => m.id === newModelId) || VEHICLE_MODELS[0];
    setConfig({
      modelId: targetModel.id,
      trimId: targetModel.trims[0]?.id || '',
      paintId: targetModel.paints[0]?.id || '',
      wheelId: targetModel.wheels[0]?.id || '',
      interiorId: targetModel.interiors[0]?.id || '',
      steeringType: targetModel.id === 'cybertruck' || targetModel.id === 'roadster' ? 'yoke' : 'round',
      fullSelfDriving: true,
      enhancedAutopilot: false,
      towHitch: false,
      wallConnector: false,
      mobileConnector: false,
    });
    setCanvasAngle('front');
  };

  const activeTrim = currentModel.trims.find((t) => t.id === config.trimId) || currentModel.trims[0];
  const activePaint = currentModel.paints.find((p) => p.id === config.paintId) || currentModel.paints[0];
  const activeWheel = currentModel.wheels.find((w) => w.id === config.wheelId) || currentModel.wheels[0];
  const activeInterior = currentModel.interiors.find((i) => i.id === config.interiorId) || currentModel.interiors[0];

  // Calculate Base + Option Cost
  const currentTotal =
    (activeTrim?.basePrice || 0) +
    activePaint.price +
    activeWheel.price +
    activeInterior.price +
    (config.fullSelfDriving ? FULL_SELF_DRIVING_PRICE : config.enhancedAutopilot ? ENHANCED_AUTOPILOT_PRICE : 0) +
    (config.towHitch ? TOW_HITCH_PRICE : 0) +
    (config.wallConnector ? WALL_CONNECTOR_PRICE : 0) +
    (config.mobileConnector ? MOBILE_CONNECTOR_PRICE : 0);

  return (
    <section id="configurator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
      {/* Model Navigation Pills (Segmented control) */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Interactive Vehicle Studio
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            Design Your {currentModel.name}
          </h2>
        </div>

        {/* Model Selector Bar */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 overflow-x-auto">
          {VEHICLE_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModelSelect(m.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                m.id === currentModel.id
                  ? 'bg-white text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Configurator Split: Left Visualizer + Specs, Right Configuration Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Sticky visualizer + specs) */}
        <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
          {/* Real-time Dynamic Car Canvas */}
          <VehicleCanvas
            model={currentModel}
            paint={activePaint}
            wheel={activeWheel}
            interior={activeInterior}
            selectedAngle={canvasAngle}
            onAngleChange={setCanvasAngle}
          />

          {/* Key Performance Indicators (Specs Strip) */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800">
            <div className="text-center p-2">
              <span className="text-[11px] text-zinc-400 block">Acceleration</span>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-0.5">
                {activeTrim?.acceleration0to60}s
              </div>
              <span className="text-[10px] text-zinc-500">0-60 mph</span>
            </div>

            <div className="text-center p-2 border-x border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">EPA Est. Range</span>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-0.5">
                {activeTrim ? activeTrim.rangeMiles + activeWheel.rangeDeltaMiles : 300} mi
              </div>
              <span className="text-[10px] text-zinc-500">Single Charge</span>
            </div>

            <div className="text-center p-2">
              <span className="text-[11px] text-zinc-400 block">Top Speed</span>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-0.5">
                {activeTrim?.topSpeedMph} mph
              </div>
              <span className="text-[10px] text-zinc-500">Dual/Tri Motor</span>
            </div>
          </div>

          {/* Quick Schedule Test Drive Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Experience It In Person</span>
                <span className="text-[11px] text-zinc-400">Self-serve demo drives available today near you</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenTestDrive(currentModel.id)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors whitespace-nowrap"
            >
              Book Demo Drive
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Options Configuration */}
        <div className="lg:col-span-5 space-y-8 bg-[#111216] border border-zinc-800/90 rounded-2xl p-6 lg:p-7 shadow-xl">
          {/* Header Summary */}
          <div className="pb-4 border-b border-zinc-800 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{currentModel.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{currentModel.headline}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Configured Price</span>
              <span className="text-xl font-bold font-mono tabular-nums text-white">
                ${currentTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Step 1: Powertrain & Trim */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              1. Powertrain & Performance
            </label>
            <div className="space-y-2">
              {currentModel.trims.map((trim) => {
                const isSelected = config.trimId === trim.id;
                return (
                  <button
                    key={trim.id}
                    type="button"
                    onClick={() => setConfig({ ...config, trimId: trim.id })}
                    className={`w-full p-4 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-zinc-800/90 border-white text-white shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{trim.name}</span>
                      <span className="font-mono tabular-nums font-semibold text-sm">
                        ${trim.basePrice.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{trim.tagline}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400 font-mono">
                      <span>{trim.acceleration0to60}s 0-60</span>
                      <span>·</span>
                      <span>{trim.rangeMiles} mi range</span>
                      <span>·</span>
                      <span>{trim.peakHorsepower} hp</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Exterior Paint */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                2. Exterior Color
              </label>
              <span className="text-xs text-zinc-400">
                {activePaint.name} {activePaint.price > 0 ? `(+$${activePaint.price.toLocaleString()})` : '(Included)'}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {currentModel.paints.map((paint) => {
                const isSelected = config.paintId === paint.id;
                return (
                  <button
                    key={paint.id}
                    type="button"
                    onClick={() => {
                      setConfig({ ...config, paintId: paint.id });
                      if (canvasAngle === 'interior') setCanvasAngle('front');
                    }}
                    title={`${paint.name} - ${paint.price === 0 ? 'Included' : `$${paint.price}`}`}
                    className={`relative w-10 h-10 rounded-full transition-transform focus:outline-none ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: paint.hex }}
                  >
                    {paint.id === 'stainless-steel' && (
                      <span className="text-[8px] font-mono font-bold text-black flex items-center justify-center">
                        30X
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Wheels */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              3. Wheels & Aerodynamics
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentModel.wheels.map((wheel) => {
                const isSelected = config.wheelId === wheel.id;
                return (
                  <button
                    key={wheel.id}
                    type="button"
                    onClick={() => setConfig({ ...config, wheelId: wheel.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-zinc-800 border-white text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-200">{wheel.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-1 flex justify-between font-mono">
                      <span>{wheel.price === 0 ? 'Included' : `+$${wheel.price.toLocaleString()}`}</span>
                      {wheel.rangeDeltaMiles !== 0 && (
                        <span className={wheel.rangeDeltaMiles > 0 ? 'text-emerald-400' : 'text-zinc-500'}>
                          {wheel.rangeDeltaMiles > 0 ? `+${wheel.rangeDeltaMiles}` : wheel.rangeDeltaMiles} mi
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Interior Decor & Steering */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                4. Interior Cabin
              </label>
              <button
                type="button"
                onClick={() => setCanvasAngle('interior')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                Preview Cabin
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentModel.interiors.map((interior) => {
                const isSelected = config.interiorId === interior.id;
                return (
                  <button
                    key={interior.id}
                    type="button"
                    onClick={() => {
                      setConfig({ ...config, interiorId: interior.id });
                      setCanvasAngle('interior');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-zinc-800 border-white text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-zinc-600 shrink-0"
                      style={{ backgroundColor: interior.hex }}
                    />
                    <div className="truncate">
                      <span className="text-xs font-medium block truncate text-zinc-200">
                        {interior.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {interior.price === 0 ? 'Included' : `+$${interior.price}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Steering Option (Round vs Yoke) */}
            {activeInterior.steeringOptions && activeInterior.steeringOptions.length > 1 && (
              <div className="pt-2">
                <span className="text-xs text-zinc-400 block mb-1.5">Steering Control:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, steeringType: 'round' })}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      config.steeringType === 'round'
                        ? 'bg-zinc-800 border-white text-white font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Traditional Steering Wheel
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, steeringType: 'yoke' })}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      config.steeringType === 'yoke'
                        ? 'bg-zinc-800 border-white text-white font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Yoke Steering
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 5: Full Self-Driving Capability */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              5. Autopilot & Full Self-Driving
            </label>

            <div className="space-y-2">
              <div
                onClick={() =>
                  setConfig({
                    ...config,
                    fullSelfDriving: !config.fullSelfDriving,
                    enhancedAutopilot: false,
                  })
                }
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  config.fullSelfDriving
                    ? 'bg-zinc-800/90 border-cyan-500/60 ring-1 ring-cyan-500/40 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Full Self-Driving (Supervised)</span>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-sm">
                    +${FULL_SELF_DRIVING_PRICE.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Navigates city streets, makes lane changes, navigates interchanges, and parks automatically under driver supervision.
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400 font-medium">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      config.fullSelfDriving ? 'bg-cyan-500 border-cyan-500 text-zinc-950' : 'border-zinc-700'
                    }`}
                  >
                    {config.fullSelfDriving && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{config.fullSelfDriving ? 'Selected' : 'Add to Build'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6: Charging Accessories */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              6. Home Charging & Accessories
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={config.wallConnector}
                  onChange={(e) => setConfig({ ...config, wallConnector: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-white focus:ring-0"
                />
                <div>
                  <span className="font-medium text-white block">Tesla Wall Connector</span>
                  <span className="text-[11px] text-zinc-500">Up to 44 miles of range per hour of charge</span>
                </div>
              </div>
              <span className="font-mono text-zinc-400">+${WALL_CONNECTOR_PRICE}</span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={config.mobileConnector}
                  onChange={(e) => setConfig({ ...config, mobileConnector: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-white focus:ring-0"
                />
                <div>
                  <span className="font-medium text-white block">Mobile Connector Bundle</span>
                  <span className="text-[11px] text-zinc-500">For standard 120V household or 240V outlets</span>
                </div>
              </div>
              <span className="font-mono text-zinc-400">+${MOBILE_CONNECTOR_PRICE}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Embedded Comprehensive Payment Calculator Section */}
      <div className="mt-16">
        <PaymentCalculator
          model={currentModel}
          config={config}
          onInitiateOrder={(method, cryptoCode) => onInitiateOrder(config, method, cryptoCode)}
        />
      </div>
    </section>
  );
};
