import React from 'react';
import { VehicleModelId } from '../types/tesla';

interface HeaderProps {
  onSelectModel: (id: VehicleModelId) => void;
  onOpenTestDrive: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectModel,
  onOpenTestDrive,
  onScrollToSection,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d0f]/90 backdrop-blur-md border-b border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 py-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onScrollToSection('hero')}
          className="text-lg font-bold tracking-[0.25em] text-white hover:text-zinc-200 transition-colors whitespace-nowrap shrink-0 uppercase font-mono"
        >
          T E S L A
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wider text-zinc-300">
          <button
            type="button"
            onClick={() => {
              onSelectModel('models');
              onScrollToSection('configurator');
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 uppercase"
          >
            Model S
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectModel('model3');
              onScrollToSection('configurator');
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 uppercase"
          >
            Model 3
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectModel('cybertruck');
              onScrollToSection('configurator');
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 uppercase"
          >
            Cybertruck
          </button>
          <button
            type="button"
            onClick={() => onScrollToSection('configurator')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 uppercase"
          >
            Configurator
          </button>
          <button
            type="button"
            onClick={() => onScrollToSection('inventory')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 uppercase"
          >
            Inventory
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenTestDrive}
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            Demo Drive
          </button>
        </div>
      </div>
    </header>
  );
};
