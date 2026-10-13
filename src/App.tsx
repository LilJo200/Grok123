import React, { useState } from 'react';
import {
  VehicleModelId,
  ConfigurationState,
  PaymentMethod,
  CryptoCurrencyCode,
  CustomerOrder,
} from './types/tesla';
import { VEHICLE_MODELS, INVENTORY_VEHICLES } from './data/teslaData';
import { Header } from './components/Header';
import { HeroFleet } from './components/HeroFleet';
import { Configurator } from './components/Configurator';
import { InventoryView } from './components/InventoryView';
import { TeslaSpecsComparison } from './components/TeslaSpecsComparison';
import { OrderBookingModal } from './components/OrderBookingModal';
import { CryptoCheckoutModal } from './components/CryptoCheckoutModal';
import { DemoDriveModal } from './components/DemoDriveModal';
import { Footer } from './components/Footer';

export default function App() {
  const [selectedModelId, setSelectedModelId] = useState<VehicleModelId>('models');

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState(false);

  // Active configuration for order
  const [activeConfig, setActiveConfig] = useState<ConfigurationState>({
    modelId: 'models',
    trimId: 'plaid',
    paintId: 'ultra-red',
    wheelId: 'tempest-19',
    interiorId: 'all-black',
    steeringType: 'round',
    fullSelfDriving: true,
    enhancedAutopilot: false,
    towHitch: false,
    wallConnector: false,
    mobileConnector: false,
  });

  const [activePaymentMethod, setActivePaymentMethod] = useState<PaymentMethod>('crypto');
  const [activeCryptoCode, setActiveCryptoCode] = useState<CryptoCurrencyCode>('BTC');

  // Completed Orders store
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);

  // Smooth scroll helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler from Configurator
  const handleInitiateOrder = (
    config: ConfigurationState,
    paymentMethod: PaymentMethod,
    cryptoCode?: CryptoCurrencyCode
  ) => {
    setActiveConfig(config);
    setActivePaymentMethod(paymentMethod);
    if (cryptoCode) setActiveCryptoCode(cryptoCode);

    if (paymentMethod === 'crypto') {
      setIsCryptoModalOpen(true);
    } else {
      setIsOrderModalOpen(true);
    }
  };

  // Direct Crypto Checkout from Hero
  const handleDirectCryptoFromHero = () => {
    const currentModel = VEHICLE_MODELS.find((m) => m.id === selectedModelId) || VEHICLE_MODELS[0];
    setActiveConfig({
      modelId: currentModel.id,
      trimId: currentModel.trims[0]?.id || '',
      paintId: currentModel.paints[0]?.id || '',
      wheelId: currentModel.wheels[0]?.id || '',
      interiorId: currentModel.interiors[0]?.id || '',
      steeringType: currentModel.id === 'cybertruck' ? 'yoke' : 'round',
      fullSelfDriving: true,
      enhancedAutopilot: false,
      towHitch: false,
      wallConnector: false,
      mobileConnector: false,
    });
    setActivePaymentMethod('crypto');
    setIsCryptoModalOpen(true);
  };

  // Handler from Ready Inventory
  const handleSelectInventoryVehicle = (
    invVehicle: typeof INVENTORY_VEHICLES[0],
    cryptoCode?: CryptoCurrencyCode
  ) => {
    const targetModel = VEHICLE_MODELS.find((m) => m.id === invVehicle.modelId) || VEHICLE_MODELS[0];
    const targetPaint = targetModel.paints.find((p) => p.name === invVehicle.exteriorColor) || targetModel.paints[0];
    const targetWheel = targetModel.wheels.find((w) => w.name === invVehicle.wheels) || targetModel.wheels[0];

    setActiveConfig({
      modelId: targetModel.id,
      trimId: targetModel.trims[0]?.id || '',
      paintId: targetPaint?.id || targetModel.paints[0]?.id || '',
      wheelId: targetWheel?.id || targetModel.wheels[0]?.id || '',
      interiorId: targetModel.interiors[0]?.id || '',
      steeringType: 'round',
      fullSelfDriving: invVehicle.autopilot.includes('Full Self-Driving'),
      enhancedAutopilot: false,
      towHitch: false,
      wallConnector: false,
      mobileConnector: false,
    });

    if (cryptoCode) setActiveCryptoCode(cryptoCode);
    setActivePaymentMethod('crypto');
    setIsOrderModalOpen(true);
  };

  // When payment succeeds in Crypto Modal
  const handleCryptoPaymentSuccess = (cryptoDetails: {
    code: CryptoCurrencyCode;
    amount: number;
    txHash: string;
    rateUsd: number;
  }) => {
    setIsCryptoModalOpen(false);
    setIsOrderModalOpen(true);
  };

  const handleOrderCompleted = (order: CustomerOrder) => {
    setRecentOrders((prev) => [order, ...prev]);
  };

  const selectedModel = VEHICLE_MODELS.find((m) => m.id === selectedModelId) || VEHICLE_MODELS[0];

  return (
    <div className="min-h-screen bg-[#0c0d0f] text-zinc-100 flex flex-col selection:bg-zinc-700 selection:text-white">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        onSelectModel={(id) => {
          setSelectedModelId(id);
          scrollToSection('configurator');
        }}
        onOpenTestDrive={() => setIsTestDriveModalOpen(true)}
        onScrollToSection={scrollToSection}
      />

      <main className="flex-1">
        {/* Hero Fleet Showcase with fast vehicle switching and specs */}
        <HeroFleet
          selectedModelId={selectedModelId}
          onSelectModel={setSelectedModelId}
          onConfigureClick={() => scrollToSection('configurator')}
          onOpenTestDrive={() => setIsTestDriveModalOpen(true)}
          onOrderCryptoClick={handleDirectCryptoFromHero}
        />

        {/* Interactive Vehicle Configurator + Comprehensive Payment Calculator */}
        <Configurator
          selectedModelId={selectedModelId}
          onSelectModelId={setSelectedModelId}
          onInitiateOrder={handleInitiateOrder}
          onOpenTestDrive={() => setIsTestDriveModalOpen(true)}
        />

        {/* Ready Inventory Section with crypto checkout */}
        <InventoryView
          onSelectVehicleForCheckout={handleSelectInventoryVehicle}
        />

        {/* Lineup Matrix Comparison */}
        <TeslaSpecsComparison
          onSelectModel={(id) => {
            setSelectedModelId(id);
            scrollToSection('configurator');
          }}
        />
      </main>

      {/* Clean Minimalist Footer */}
      <Footer />

      {/* MODALS */}
      {/* 1. Complete Booking / Reservation Modal */}
      <OrderBookingModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        config={activeConfig}
        paymentMethod={activePaymentMethod}
        initialCryptoCode={activeCryptoCode}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* 2. Direct Crypto Checkout Modal */}
      <CryptoCheckoutModal
        isOpen={isCryptoModalOpen}
        onClose={() => setIsCryptoModalOpen(false)}
        usdAmount={
          (VEHICLE_MODELS.find((m) => m.id === activeConfig.modelId)?.trims[0]?.basePrice || 74990) +
          (activeConfig.fullSelfDriving ? 8000 : 0) +
          1390 +
          250
        }
        initialCryptoCode={activeCryptoCode}
        modelName={selectedModel.name}
        onPaymentSuccess={handleCryptoPaymentSuccess}
      />

      {/* 3. Demo Drive Modal */}
      <DemoDriveModal
        isOpen={isTestDriveModalOpen}
        onClose={() => setIsTestDriveModalOpen(false)}
        defaultModelId={selectedModelId}
      />
    </div>
  );
}
