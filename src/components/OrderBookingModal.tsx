import React, { useState } from 'react';
import {
  VehicleModel,
  ConfigurationState,
  PaymentMethod,
  CryptoCurrencyCode,
  CustomerOrder,
} from '../types/tesla';
import {
  VEHICLE_MODELS,
  ORDER_FEE,
  DESTINATION_FEE,
  FULL_SELF_DRIVING_PRICE,
  ENHANCED_AUTOPILOT_PRICE,
  TOW_HITCH_PRICE,
  WALL_CONNECTOR_PRICE,
  MOBILE_CONNECTOR_PRICE,
  TESLA_SHOWROOMS,
} from '../data/teslaData';
import {
  SUPPORTED_CRYPTO_CURRENCIES,
  convertUsdToCrypto,
  formatCryptoAmount,
  generateSimulatedTxHash,
} from '../data/cryptoRates';
import {
  X,
  CheckCircle2,
  Car,
  Coins,
  CreditCard,
  MapPin,
  Calendar,
  FileText,
  Printer,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';

interface OrderBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfigurationState | null;
  paymentMethod: PaymentMethod;
  initialCryptoCode?: CryptoCurrencyCode;
  onOrderCompleted?: (order: CustomerOrder) => void;
}

export const OrderBookingModal: React.FC<OrderBookingModalProps> = ({
  isOpen,
  onClose,
  config,
  paymentMethod: initialPaymentMethod,
  initialCryptoCode = 'BTC',
  onOrderCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState<'info' | 'payment' | 'confirmation'>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod || 'crypto');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrencyCode>(initialCryptoCode);
  const [isFullPayment, setIsFullPayment] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('Alex Mercer');
  const [email, setEmail] = useState('alex.mercer@example.com');
  const [phone, setPhone] = useState('(555) 382-9011');
  const [zipCode, setZipCode] = useState('94304');
  const [deliveryType, setDeliveryType] = useState<'home' | 'center'>('center');
  const [selectedShowroom, setSelectedShowroom] = useState(TESLA_SHOWROOMS[0].name);

  // Crypto copy feedback
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Confirmed Order State
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrder | null>(null);

  if (!isOpen || !config) return null;

  const currentModel = VEHICLE_MODELS.find((m) => m.id === config.modelId) || VEHICLE_MODELS[0];
  const activeTrim = currentModel.trims.find((t) => t.id === config.trimId) || currentModel.trims[0];
  const activePaint = currentModel.paints.find((p) => p.id === config.paintId) || currentModel.paints[0];
  const activeWheel = currentModel.wheels.find((w) => w.id === config.wheelId) || currentModel.wheels[0];
  const activeInterior = currentModel.interiors.find((i) => i.id === config.interiorId) || currentModel.interiors[0];

  // Pricing
  const basePrice = activeTrim ? activeTrim.basePrice : 0;
  const softwarePrice = config.fullSelfDriving
    ? FULL_SELF_DRIVING_PRICE
    : config.enhancedAutopilot
    ? ENHANCED_AUTOPILOT_PRICE
    : 0;
  const accessoriesPrice =
    (config.towHitch ? TOW_HITCH_PRICE : 0) +
    (config.wallConnector ? WALL_CONNECTOR_PRICE : 0) +
    (config.mobileConnector ? MOBILE_CONNECTOR_PRICE : 0);

  const totalVehiclePrice =
    basePrice +
    activePaint.price +
    activeWheel.price +
    activeInterior.price +
    softwarePrice +
    accessoriesPrice +
    DESTINATION_FEE +
    ORDER_FEE;

  const depositDue = isFullPayment ? totalVehiclePrice : ORDER_FEE;
  const cryptoInfo = SUPPORTED_CRYPTO_CURRENCIES[selectedCrypto];
  const cryptoAmountDue = convertUsdToCrypto(depositDue, selectedCrypto);

  const handlePlaceOrder = () => {
    const randomRn = `RN119${Math.floor(100000 + Math.random() * 900000)}`;
    const randomVin = `5YJ${currentModel.name.replace('Model ', '')}${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: CustomerOrder = {
      orderNumber: randomRn,
      vin: randomVin,
      modelName: currentModel.name,
      trimName: activeTrim?.name || currentModel.name,
      paintName: activePaint.name,
      wheelName: activeWheel.name,
      interiorName: activeInterior.name,
      features: [
        activeTrim?.drivetrain || '',
        config.fullSelfDriving ? 'Full Self-Driving (Supervised)' : 'Standard Autopilot',
        config.wallConnector ? 'Tesla Wall Connector' : '',
      ].filter(Boolean),
      totalPriceUsd: totalVehiclePrice,
      depositPaidUsd: depositDue,
      paymentMethod,
      cryptoDetails:
        paymentMethod === 'crypto'
          ? {
              code: selectedCrypto,
              amount: cryptoAmountDue,
              txHash: generateSimulatedTxHash(selectedCrypto),
              rateUsd: cryptoInfo.usdPrice,
            }
          : undefined,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      deliveryLocation: deliveryType === 'center' ? selectedShowroom : `Home Delivery to ${zipCode}`,
      deliveryType,
      orderDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      estimatedDeliveryWindow: currentModel.deliveryEstimateWeeks,
    };

    setConfirmedOrder(newOrder);
    setCurrentStep('confirmation');
    if (onOrderCompleted) onOrderCompleted(newOrder);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#111216] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {currentStep === 'confirmation' ? 'Order Confirmed' : `Reserve ${currentModel.name}`}
              </h3>
              <p className="text-xs text-zinc-400">
                {activeTrim?.name} · Total: ${totalVehiclePrice.toLocaleString()} USD
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: CUSTOMER & DELIVERY INFO */}
          {currentStep === 'info' && (
            <div className="space-y-6">
              {/* Build Summary Preview Card */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white">{currentModel.name} {activeTrim?.name}</div>
                  <div className="text-xs text-zinc-400">
                    {activePaint.name} · {activeWheel.name} · {activeInterior.name}
                  </div>
                  {config.fullSelfDriving && (
                    <div className="text-[11px] text-cyan-400 font-medium">
                      Full Self-Driving (Supervised) included
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-zinc-400 block">Due Today</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">${ORDER_FEE}</span>
                </div>
              </div>

              {/* Contact Details Form */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-zinc-500"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-zinc-500"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-zinc-500"
                      placeholder="(555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Registration Postal Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-zinc-500"
                      placeholder="94304"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Preference */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Delivery Preference
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('center')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      deliveryType === 'center'
                        ? 'bg-zinc-800 border-white text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">Tesla Delivery Center</div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Pick up with delivery specialist walkthrough
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('home')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      deliveryType === 'home'
                        ? 'bg-zinc-800 border-white text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">Direct Home Delivery</div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Delivered straight to your driveway (Zip: {zipCode})
                    </div>
                  </button>
                </div>

                {deliveryType === 'center' && (
                  <div className="pt-2">
                    <label className="block text-xs text-zinc-400 mb-1">Select Delivery Hub</label>
                    <select
                      value={selectedShowroom}
                      onChange={(e) => setSelectedShowroom(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                    >
                      {TESLA_SHOWROOMS.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.state})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep('payment')}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-white hover:bg-zinc-200 text-zinc-950 transition-colors flex items-center justify-center gap-2"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD SELECTION */}
          {currentStep === 'payment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep('info')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Contact Info</span>
                </button>

                <div className="text-xs text-zinc-400">
                  Step 2 of 2: Confirm Deposit
                </div>
              </div>

              {/* Payment Type: Deposit ($250) vs Full Balance */}
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Payment Amount</span>
                  <span className="text-[11px] text-zinc-400">
                    {isFullPayment ? 'Full vehicle payment' : 'Order reservation fee'}
                  </span>
                </div>

                <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsFullPayment(false)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      !isFullPayment ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
                    }`}
                  >
                    $250 Fee
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullPayment(true)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      isFullPayment ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
                    }`}
                  >
                    Full ${totalVehiclePrice.toLocaleString()}
                  </button>
                </div>
              </div>

              {/* Select Payment Rails */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Select Payment Rail
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'crypto'
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Coins className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <span className="text-xs font-semibold block">Crypto Pay</span>
                    <span className="text-[10px] text-zinc-500">BTC, ETH, DOGE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-zinc-800 border-white text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-semibold block">Credit Card</span>
                    <span className="text-[10px] text-zinc-500">Apple Pay / Visa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('loan')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === 'loan'
                        ? 'bg-zinc-800 border-white text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-semibold block">Financing</span>
                    <span className="text-[10px] text-zinc-500">Loan / Lease</span>
                  </button>
                </div>
              </div>

              {/* If Crypto Rail Selected */}
              {paymentMethod === 'crypto' && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Choose Digital Currency:</span>
                    <span className="text-xs text-amber-400 font-mono">
                      {cryptoAmountDue} {selectedCrypto}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(SUPPORTED_CRYPTO_CURRENCIES) as CryptoCurrencyCode[]).map((code) => {
                      const c = SUPPORTED_CRYPTO_CURRENCIES[code];
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setSelectedCrypto(code)}
                          className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all ${
                            selectedCrypto === code
                              ? 'bg-zinc-800 border-amber-500 text-white ring-1 ring-amber-500'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {code}
                        </button>
                      );
                    })}
                  </div>

                  {/* Vault Address */}
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 font-mono text-[11px] text-zinc-400 break-all flex items-center justify-between gap-2">
                    <span className="truncate">{cryptoInfo.depositAddress}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(cryptoInfo.depositAddress);
                        setCopiedAddress(true);
                        setTimeout(() => setCopiedAddress(false), 2000);
                      }}
                      className="text-zinc-200 hover:text-white shrink-0 p-1"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cryptographic proof generated immediately upon submission.</span>
                  </div>
                </div>
              )}

              {/* If Credit Card Selected */}
              {paymentMethod === 'cash' && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4242 •••• •••• 4242"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Expiry</label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">CVC</label>
                      <input
                        type="text"
                        defaultValue="928"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Final Reserve Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {paymentMethod === 'crypto'
                    ? `Confirm & Send ${cryptoAmountDue} ${selectedCrypto}`
                    : `Authorize $${depositDue} Deposit`}
                </span>
              </button>
            </div>
          )}

          {/* STEP 3: ORDER CONFIRMED PASS */}
          {currentStep === 'confirmation' && confirmedOrder && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">Congratulations, {confirmedOrder.customerName}!</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Your Tesla reservation is officially confirmed. A copy has been dispatched to {confirmedOrder.customerEmail}.
                </p>
              </div>

              {/* Digital Pass / Receipt Box */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Reservation Number</span>
                    <span className="text-lg font-mono font-bold text-white tracking-wider">
                      {confirmedOrder.orderNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Assigned VIN</span>
                    <span className="text-xs font-mono text-zinc-300">
                      {confirmedOrder.vin}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Vehicle:</span>
                    <span className="text-white font-medium">{confirmedOrder.modelName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Configuration:</span>
                    <span className="text-white font-medium">{confirmedOrder.trimName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Exterior Paint:</span>
                    <span className="text-white font-medium">{confirmedOrder.paintName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Est. Delivery Window:</span>
                    <span className="text-emerald-400 font-medium">{confirmedOrder.estimatedDeliveryWindow}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Delivery Destination:</span>
                    <span className="text-white font-medium truncate block">{confirmedOrder.deliveryLocation}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Deposit Received:</span>
                    <span className="text-white font-mono font-semibold">
                      ${confirmedOrder.depositPaidUsd.toLocaleString()} USD
                    </span>
                  </div>
                </div>

                {confirmedOrder.cryptoDetails && (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-amber-500/30 text-xs space-y-1 font-mono">
                    <div className="flex items-center justify-between text-amber-300">
                      <span>Settled via {confirmedOrder.cryptoDetails.code}</span>
                      <span>{confirmedOrder.cryptoDetails.amount} {confirmedOrder.cryptoDetails.code}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      Tx: {confirmedOrder.cryptoDetails.txHash}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
