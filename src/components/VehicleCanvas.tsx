import React, { useState } from 'react';
import { VehicleModel, PaintOption, WheelOption, InteriorOption } from '../types/tesla';
import { Eye, RotateCw, Lightbulb, Sparkles } from 'lucide-react';
import { TESLA_INTERIOR_IMAGE } from '../data/teslaData';

interface VehicleCanvasProps {
  model: VehicleModel;
  paint: PaintOption;
  wheel: WheelOption;
  interior: InteriorOption;
  selectedAngle: 'front' | 'side' | 'rear' | 'interior' | 'cinematic';
  onAngleChange: (angle: 'front' | 'side' | 'rear' | 'interior' | 'cinematic') => void;
}

export const VehicleCanvas: React.FC<VehicleCanvasProps> = ({
  model,
  paint,
  wheel,
  interior,
  selectedAngle,
  onAngleChange,
}) => {
  const [headlightsOn, setHeadlightsOn] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  // Determine car silhouette based on model
  const isCybertruck = model.id === 'cybertruck';
  const isRoadster = model.id === 'roadster';
  const isSUV = model.id === 'modely' || model.id === 'modelx';

  const rotateToNext = () => {
    setIsRotating(true);
    const angles: Array<'front' | 'side' | 'rear'> = ['front', 'side', 'rear'];
    const currentIndex = angles.indexOf(selectedAngle as any);
    const nextAngle = angles[(currentIndex + 1) % angles.length] || 'front';
    onAngleChange(nextAngle);
    setTimeout(() => setIsRotating(false), 300);
  };

  return (
    <div className="relative w-full aspect-[16/10] md:aspect-[16/9] bg-gradient-to-b from-[#131418] via-[#0c0d10] to-[#07080a] rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl flex flex-col justify-between p-4 md:p-6 select-none group">
      {/* Top Overlay Controls: Angles & Lighting */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 backdrop-blur-md rounded-lg border border-zinc-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => onAngleChange('front')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              selectedAngle === 'front'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Front 3/4
          </button>
          <button
            type="button"
            onClick={() => onAngleChange('side')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              selectedAngle === 'side'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Side Profile
          </button>
          <button
            type="button"
            onClick={() => onAngleChange('rear')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              selectedAngle === 'rear'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Rear 3/4
          </button>
          <button
            type="button"
            onClick={() => onAngleChange('interior')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              selectedAngle === 'interior'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cabin Interior
          </button>
          <button
            type="button"
            onClick={() => onAngleChange('cinematic')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              selectedAngle === 'cinematic'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Studio View
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selectedAngle !== 'interior' && selectedAngle !== 'cinematic' && (
            <button
              type="button"
              onClick={() => setHeadlightsOn(!headlightsOn)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                headlightsOn
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle Matrix LED Headlights"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline whitespace-nowrap">Lights</span>
            </button>
          )}

          <button
            type="button"
            onClick={rotateToNext}
            className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 text-xs"
            title="Rotate View"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline whitespace-nowrap">Rotate</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden my-2">
        {/* Subtle ground reflection & grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent pointer-events-none" />

        {selectedAngle === 'cinematic' ? (
          <div className="relative w-full h-full flex items-center justify-center animate-fade-in">
            <img
              src={model.heroImage}
              alt={`${model.name} cinematic studio view`}
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white">
              Studio Photography · {model.name}
            </div>
          </div>
        ) : selectedAngle === 'interior' ? (
          <div className="relative w-full h-full flex items-center justify-center animate-fade-in">
            <img
              src={TESLA_INTERIOR_IMAGE}
              alt="Tesla minimalist cabin interior"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
            {/* Interior tint overlay for custom interior selection */}
            {interior.id === 'all-black' && (
              <div className="absolute inset-0 bg-zinc-950/25 pointer-events-none rounded-xl" />
            )}
            {interior.id === 'cream' && (
              <div className="absolute inset-0 bg-amber-900/10 pointer-events-none rounded-xl" />
            )}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: interior.hex }} />
              <span>{interior.name} Interior</span>
              <span className="text-zinc-500">·</span>
              <span>17" Cinematic Screen</span>
            </div>
          </div>
        ) : (
          /* Dynamic Automotive Vector Renderer reflecting chosen Paint & Wheels */
          <div className="relative w-full max-w-4xl h-full flex items-center justify-center transition-all duration-500">
            {/* Ground shadow & ambient reflection */}
            <div
              className="absolute bottom-6 w-[75%] h-8 rounded-[100%] blur-xl opacity-60 transition-colors duration-500"
              style={{
                backgroundColor: '#000000',
              }}
            />

            {/* Ambient Headlight Projection on Floor */}
            {headlightsOn && selectedAngle !== 'rear' && (
              <div className="absolute bottom-12 -left-12 w-64 h-32 bg-cyan-400/10 blur-3xl transform -rotate-12 pointer-events-none" />
            )}

            {/* SVG Render Engine for the Vehicle with dynamic paint and angles */}
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-full max-h-[380px] drop-shadow-2xl transition-transform duration-300 transform group-hover:scale-[1.01]"
            >
              <defs>
                {/* Metallic paint gradient based on paint.hex */}
                <linearGradient id={`car-paint-${paint.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={paint.hex} stopOpacity="1" />
                  <stop offset="45%" stopColor={paint.hex} stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#ffffff" stopOpacity="0.25" />
                  <stop offset="85%" stopColor={paint.hex} stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
                </linearGradient>

                {/* Glass roof and windshield gradient */}
                <linearGradient id="tesla-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#1e293b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
                </linearGradient>

                {/* Headlight LED glow */}
                <filter id="headlight-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* RENDER BASED ON PERSPECTIVE */}
              {selectedAngle === 'side' ? (
                /* SIDE PROFILE VIEW */
                <g className="transition-all duration-500">
                  {/* Vehicle Body Base */}
                  {isCybertruck ? (
                    /* Cybertruck Angular Exoskeleton */
                    <path
                      d="M 120 340 L 150 240 L 450 140 L 850 250 L 920 340 L 840 340 C 820 280 740 280 720 340 L 320 340 C 300 280 220 280 200 340 Z"
                      fill={isCybertruck && paint.id === 'stainless-steel' ? '#9da6af' : paint.hex}
                      stroke="#3f3f46"
                      strokeWidth="2"
                    />
                  ) : (
                    /* Streamlined Tesla Aerodynamic Profile (Model S / 3 / Y / X / Roadster) */
                    <path
                      d={
                        isSUV
                          ? 'M 110 340 C 110 320 130 280 180 270 C 230 260 300 240 370 190 C 440 145 610 140 700 180 C 780 215 840 260 880 280 C 900 290 920 320 920 340 L 840 340 C 820 270 720 270 700 340 L 330 340 C 310 270 210 270 190 340 Z'
                          : isRoadster
                          ? 'M 110 340 C 110 320 140 290 190 280 C 250 270 320 250 400 220 C 470 190 620 190 680 220 C 760 250 830 270 890 290 C 910 300 920 320 920 340 L 840 340 C 820 270 720 270 700 340 L 330 340 C 310 270 210 270 190 340 Z'
                          : 'M 100 340 C 100 320 130 280 180 270 C 230 260 310 240 390 200 C 460 160 620 160 700 200 C 770 230 830 270 880 285 C 900 295 920 320 920 340 L 840 340 C 820 270 720 270 700 340 L 330 340 C 310 270 210 270 190 340 Z'
                      }
                      fill={`url(#car-paint-${paint.id})`}
                      stroke="#27272a"
                      strokeWidth="2"
                    />
                  )}

                  {/* Window Greenhouses */}
                  <path
                    d={
                      isCybertruck
                        ? 'M 240 240 L 450 155 L 750 250 L 520 250 Z'
                        : isSUV
                        ? 'M 350 240 C 380 200 450 165 550 160 C 650 160 710 190 730 240 Z'
                        : 'M 370 235 C 400 195 470 175 560 175 C 650 175 710 205 740 235 Z'
                    }
                    fill="url(#tesla-glass)"
                    stroke="#18181b"
                    strokeWidth="3"
                  />

                  {/* B-pillar divider */}
                  <line x1="530" y1="170" x2="530" y2="245" stroke="#09090b" strokeWidth="6" />

                  {/* Flush Door Handles (Tesla signature) */}
                  <rect x="440" y="260" width="28" height="4" rx="2" fill="#71717a" />
                  <rect x="620" y="260" width="28" height="4" rx="2" fill="#71717a" />

                  {/* Front Wheel */}
                  <g transform="translate(250, 340)">
                    <circle cx="0" cy="0" r="62" fill="#09090b" stroke="#27272a" strokeWidth="4" />
                    <circle cx="0" cy="0" r="48" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                    {/* Spokes */}
                    <circle cx="0" cy="0" r="16" fill="#09090b" />
                    <line x1="-36" y1="-36" x2="36" y2="36" stroke="#52525b" strokeWidth="6" />
                    <line x1="36" y1="-36" x2="-36" y2="36" stroke="#52525b" strokeWidth="6" />
                    <line x1="0" y1="-42" x2="0" y2="42" stroke="#52525b" strokeWidth="6" />
                    {/* Performance Red Caliper */}
                    {model.trims[0]?.id.includes('plaid') || model.trims[0]?.id.includes('beast') ? (
                      <path d="M 28 -15 C 38 -5 38 15 28 25" stroke="#ef4444" strokeWidth="8" fill="none" />
                    ) : null}
                  </g>

                  {/* Rear Wheel */}
                  <g transform="translate(770, 340)">
                    <circle cx="0" cy="0" r="62" fill="#09090b" stroke="#27272a" strokeWidth="4" />
                    <circle cx="0" cy="0" r="48" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                    <circle cx="0" cy="0" r="16" fill="#09090b" />
                    <line x1="-36" y1="-36" x2="36" y2="36" stroke="#52525b" strokeWidth="6" />
                    <line x1="36" y1="-36" x2="-36" y2="36" stroke="#52525b" strokeWidth="6" />
                    <line x1="0" y1="-42" x2="0" y2="42" stroke="#52525b" strokeWidth="6" />
                  </g>

                  {/* Headlight & Taillight accents */}
                  {headlightsOn && (
                    <polygon
                      points="100,320 80,310 120,300"
                      fill="#38bdf8"
                      filter="url(#headlight-glow)"
                    />
                  )}
                  <rect x="915" y="300" width="8" height="20" rx="3" fill="#ef4444" />
                </g>
              ) : selectedAngle === 'rear' ? (
                /* REAR 3/4 VIEW */
                <g className="transition-all duration-500">
                  {/* Rear Body Silhouette */}
                  <path
                    d={
                      isCybertruck
                        ? 'M 200 370 L 220 220 L 780 220 L 800 370 L 700 370 C 680 320 620 320 600 370 L 400 370 C 380 320 320 320 300 370 Z'
                        : 'M 180 350 C 180 300 240 230 350 200 C 440 180 560 180 650 200 C 760 230 820 300 820 350 L 730 350 C 710 300 640 300 620 350 L 380 350 C 360 300 290 300 270 350 Z'
                    }
                    fill={`url(#car-paint-${paint.id})`}
                    stroke="#27272a"
                    strokeWidth="2"
                  />

                  {/* Rear Windshield & Glass Roof */}
                  <path
                    d={
                      isCybertruck
                        ? 'M 260 220 L 740 220 L 680 160 L 320 160 Z'
                        : 'M 300 210 C 360 180 450 170 550 170 C 640 170 700 180 700 210 L 630 260 L 370 260 Z'
                    }
                    fill="url(#tesla-glass)"
                  />

                  {/* Carbon Spoiler for Plaid / Performance */}
                  <rect x="340" y="270" width="320" height="8" rx="4" fill="#09090b" />

                  {/* Rear Continuous Lightbar / Taillights */}
                  <path
                    d={isCybertruck ? 'M 230 240 L 770 240' : 'M 260 290 Q 500 280 740 290'}
                    stroke="#ef4444"
                    strokeWidth={isCybertruck ? '8' : '6'}
                    fill="none"
                    filter="url(#headlight-glow)"
                  />

                  {/* Dual Motors / Plaid Badge */}
                  <rect x="480" y="315" width="40" height="4" rx="2" fill="#e4e4e7" />
                  <text x="500" y="310" textAnchor="middle" fill="#a1a1aa" fontSize="12" letterSpacing="4" fontFamily="monospace">
                    T E S L A
                  </text>
                </g>
              ) : (
                /* FRONT 3/4 VIEW (Default iconic angle) */
                <g className="transition-all duration-500">
                  {/* Front 3/4 Sculpted Body */}
                  <path
                    d={
                      isCybertruck
                        ? 'M 180 360 L 220 240 L 520 160 L 860 220 L 820 360 L 740 360 C 720 300 640 300 620 360 L 380 360 C 360 300 280 300 260 360 Z'
                        : isSUV
                        ? 'M 160 350 C 170 300 240 230 350 190 C 460 150 640 150 750 190 C 830 220 850 300 840 350 L 760 350 C 740 290 660 290 640 350 L 360 350 C 340 290 260 290 240 350 Z'
                        : 'M 150 340 C 160 290 240 220 360 185 C 470 155 640 155 740 185 C 820 215 850 290 840 340 L 760 340 C 740 280 660 280 640 340 L 350 340 C 330 280 250 280 230 340 Z'
                    }
                    fill={`url(#car-paint-${paint.id})`}
                    stroke="#27272a"
                    strokeWidth="2"
                  />

                  {/* Sleek Low Hood Slope */}
                  <path
                    d={
                      isCybertruck
                        ? 'M 250 260 L 520 180 L 820 240 L 680 300 L 340 300 Z'
                        : 'M 280 260 C 380 230 500 225 680 245 C 640 290 520 300 380 295 Z'
                    }
                    fill={`url(#car-paint-${paint.id})`}
                    opacity="0.9"
                  />

                  {/* Windshield & Panoramic Glass Canopy */}
                  <path
                    d={
                      isCybertruck
                        ? 'M 290 230 L 520 170 L 780 220 L 560 225 Z'
                        : 'M 350 210 C 440 180 560 180 660 210 C 620 240 500 245 400 240 Z'
                    }
                    fill="url(#tesla-glass)"
                    stroke="#18181b"
                    strokeWidth="3"
                  />

                  {/* Front Iconic Matrix LED Light Blades */}
                  {isCybertruck ? (
                    <line
                      x1="260"
                      y1="250"
                      x2="780"
                      y2="250"
                      stroke={headlightsOn ? '#e0f2fe' : '#71717a'}
                      strokeWidth="6"
                      filter={headlightsOn ? 'url(#headlight-glow)' : undefined}
                    />
                  ) : (
                    <>
                      {/* Left Headlight */}
                      <path
                        d="M 230 290 Q 280 280 320 295"
                        stroke={headlightsOn ? '#bae6fd' : '#71717a'}
                        strokeWidth="5"
                        fill="none"
                        filter={headlightsOn ? 'url(#headlight-glow)' : undefined}
                      />
                      {/* Right Headlight */}
                      <path
                        d="M 680 295 Q 720 280 770 290"
                        stroke={headlightsOn ? '#bae6fd' : '#71717a'}
                        strokeWidth="5"
                        fill="none"
                        filter={headlightsOn ? 'url(#headlight-glow)' : undefined}
                      />
                    </>
                  )}

                  {/* Iconic Tesla 'T' Emblem on Hood */}
                  <path
                    d="M 500 270 L 493 285 L 507 285 Z M 488 268 C 495 266 505 266 512 268"
                    stroke="#e4e4e7"
                    strokeWidth="2"
                    fill="#e4e4e7"
                  />

                  {/* Lower Air Intake & Aero Vent */}
                  <path
                    d="M 360 335 L 640 335 L 620 345 L 380 345 Z"
                    fill="#09090b"
                    stroke="#18181b"
                  />
                </g>
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Bottom Visual Meta bar */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-zinc-800/80 text-xs text-zinc-400 z-10 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-200">{model.name}</span>
          <span className="text-zinc-600">·</span>
          <span>{paint.name}</span>
          <span className="text-zinc-600">·</span>
          <span>{wheel.name}</span>
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums text-zinc-300">
          <span>Aerodynamic Cd: 0.219</span>
          <span className="text-zinc-700">|</span>
          <span className="text-emerald-400">Zero Emissions</span>
        </div>
      </div>
    </div>
  );
};
