import React, { useState, useMemo } from 'react';
import {
  VehicleModel,
  ConfigurationState,
  PaymentMethod,
  CryptoCurrencyCode,
  LoanParams,
  LeaseParams,
} from '../types/tesla';
import {
  DESTINATION_FEE,
  ORDER_FEE,
  FEDERAL_TAX_CREDIT,
  FULL_SELF_DRIVING_PRICE,
  ENHANCED_AUTOPILOT_PRICE,
  TOW_HITCH_PRICE,
  WALL_CONNECTOR_PRICE,
  MOBILE_CONNECTOR_PRICE,
} from '../data/teslaData';
import {
  SUPPORTED_CRYPTO_CURRENCIES,
  convertUsdToCrypto,
  formatCryptoAmount,
} from '../data/cryptoRates';
import {
  DollarSign,
  CreditCard,
  Calendar,
  Coins,
  ShieldCheck,
  Zap,
  Info,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface PaymentCalculatorProps {
  model: VehicleModel;
  config: ConfigurationState;
  onInitiateOrder: (paymentMethod: PaymentMethod, cryptoCode?: CryptoCurrencyCode) => void;
}

export const PaymentCalculator: React.FC<PaymentCalculatorProps> = ({
  model,
  config,
  onInitiateOrder,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentMethod>('crypto');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrencyCode>('BTC');
  const [cryptoPaymentType, setCryptoPaymentType] = useState<'deposit' | 'full'>('deposit');
  const [includeTaxCredit, setIncludeTaxCredit] = useState(model.federalTaxCreditEligible);

  // Loan State
  const [loanParams, setLoanParams] = useState<LoanParams>({
    downPaymentPercent: 10,
    termMonths: 72,
    annualInterestRate: 5.49,
  });

  // Lease State
  const [leaseParams, setLeaseParams] = useState<LeaseParams>({
    termMonths: 36,
    annualMileage: 10000,
    downPayment: 3999,
  });

  // Calculate Total Vehicle Price
  const pricingBreakdown = useMemo(() => {
    const activeTrim = model.trims.find((t) => t.id === config.trimId) || model.trims[0];
    const basePrice = activeTrim ? activeTrim.basePrice : 0;

    const paint = model.paints.find((p) => p.id === config.paintId);
    const paintPrice = paint ? paint.price : 0;

    const wheel = model.wheels.find((w) => w.id === config.wheelId);
    const wheelPrice = wheel ? wheel.price : 0;

    const interior = model.interiors.find((i) => i.id === config.interiorId);
    const interiorPrice = interior ? interior.price : 0;

    let softwarePrice = 0;
    if (config.fullSelfDriving) softwarePrice += FULL_SELF_DRIVING_PRICE;
    else if (config.enhancedAutopilot) softwarePrice += ENHANCED_AUTOPILOT_PRICE;

    let accessoriesPrice = 0;
    if (config.towHitch) accessoriesPrice += TOW_HITCH_PRICE;
    if (config.wallConnector) accessoriesPrice += WALL_CONNECTOR_PRICE;
    if (config.mobileConnector) accessoriesPrice += MOBILE_CONNECTOR_PRICE;

    const subtotal = basePrice + paintPrice + wheelPrice + interiorPrice + softwarePrice + accessoriesPrice;
    const estTaxCredit = includeTaxCredit && model.federalTaxCreditEligible ? FEDERAL_TAX_CREDIT : 0;
    const totalPurchasePrice = subtotal + DESTINATION_FEE + ORDER_FEE;
    const effectivePriceWithIncentives = Math.max(0, totalPurchasePrice - estTaxCredit);

    return {
      basePrice,
      paintPrice,
      wheelPrice,
      interiorPrice,
      softwarePrice,
      accessoriesPrice,
      subtotal,
      destinationFee: DESTINATION_FEE,
      orderFee: ORDER_FEE,
      taxCredit: estTaxCredit,
      totalPurchasePrice,
      effectivePriceWithIncentives,
    };
  }, [model, config, includeTaxCredit]);

  // Loan Monthly Calculation
  const loanBreakdown = useMemo(() => {
    const total = pricingBreakdown.totalPurchasePrice;
    const downPaymentAmount = (total * loanParams.downPaymentPercent) / 100;
    const principal = Math.max(0, total - downPaymentAmount);
    const monthlyRate = loanParams.annualInterestRate / 100 / 12;
    const n = loanParams.termMonths;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
        (Math.pow(1 + monthlyRate, n) - 1);
    } else {
      monthlyPayment = principal / n;
    }

    const totalLoanCost = monthlyPayment * n + downPaymentAmount;
    const totalInterest = Math.max(0, totalLoanCost - total);

    return {
      downPaymentAmount: Math.round(downPaymentAmount),
      principal: Math.round(principal),
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalLoanCost: Math.round(totalLoanCost),
    };
  }, [pricingBreakdown.totalPurchasePrice, loanParams]);

  // Lease Monthly Calculation
  const leaseBreakdown = useMemo(() => {
    const total = pricingBreakdown.totalPurchasePrice;
    // Residual value calculation (approx 52% - 58% depending on term/mileage)
    let residualPercent = leaseParams.termMonths === 24 ? 0.60 : 0.53;
    if (leaseParams.annualMileage === 12000) residualPercent -= 0.02;
    if (leaseParams.annualMileage === 15000) residualPercent -= 0.04;

    const residualValue = total * residualPercent;
    const depreciation = total - leaseParams.downPayment - residualValue;
    const monthlyDepreciation = Math.max(0, depreciation / leaseParams.termMonths);
    const moneyFactor = 0.0022; // ~5.28% APR equivalent
    const monthlyRentCharge = (total - leaseParams.downPayment + residualValue) * moneyFactor;
    const monthlyPayment = Math.round(monthlyDepreciation + monthlyRentCharge);

    return {
      monthlyPayment,
      residualValue: Math.round(residualValue),
      dueAtSigning: leaseParams.downPayment + DESTINATION_FEE + ORDER_FEE,
    };
  }, [pricingBreakdown.totalPurchasePrice, leaseParams]);

  // Crypto conversion
  const cryptoAmountDue = useMemo(() => {
    const targetUsd =
      cryptoPaymentType === 'deposit'
        ? ORDER_FEE
        : pricingBreakdown.totalPurchasePrice;
    return convertUsdToCrypto(targetUsd, selectedCrypto);
  }, [cryptoPaymentType, pricingBreakdown.totalPurchasePrice, selectedCrypto]);

  const activeCryptoInfo = SUPPORTED_CRYPTO_CURRENCIES[selectedCrypto];

  return (
    <div className="bg-[#111216] border border-zinc-800 rounded-2xl p-6 lg:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Payment & Financing Options
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Transparent pricing with zero dealership markups. Cash, loan, lease, or native crypto checkout.
          </p>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('crypto')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'crypto'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Crypto Pay
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cash')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'cash'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Cash
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('loan')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'loan'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Loan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lease')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'lease'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Lease
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="py-6">
        {/* 1. CRYPTO PAYMENT VIEW */}
        {activeTab === 'crypto' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-200">
                    Seamless Digital Currency Settlement
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tesla accepts verified on-chain transfers in Bitcoin (BTC), Ethereum (ETH), Dogecoin (DOGE), Solana (SOL), and USDT. Instant confirmation with zero wire fees.
                  </p>
                </div>
              </div>

              {/* Mode: Deposit ($250) vs Full Vehicle Amount */}
              <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setCryptoPaymentType('deposit')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    cryptoPaymentType === 'deposit'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  $250 Order Fee
                </button>
                <button
                  type="button"
                  onClick={() => setCryptoPaymentType('full')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    cryptoPaymentType === 'full'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Full Vehicle Pay
                </button>
              </div>
            </div>

            {/* Select Major Digital Currency */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Select Digital Asset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {(Object.keys(SUPPORTED_CRYPTO_CURRENCIES) as CryptoCurrencyCode[]).map((code) => {
                  const curr = SUPPORTED_CRYPTO_CURRENCIES[code];
                  const isSelected = selectedCrypto === code;
                  const targetUsd =
                    cryptoPaymentType === 'deposit' ? ORDER_FEE : pricingBreakdown.totalPurchasePrice;
                  const amount = convertUsdToCrypto(targetUsd, code);

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSelectedCrypto(code)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-zinc-800/90 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs text-black"
                            style={{ backgroundColor: curr.iconColor }}
                          >
                            {curr.symbol}
                          </span>
                          <span className="font-bold text-sm text-white">{curr.code}</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
                          ${curr.usdPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs font-mono tabular-nums text-zinc-300 font-medium">
                        {amount} {code}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1 truncate">
                        {curr.network}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Crypto Quote Summary Box */}
            <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <span className="text-xs text-zinc-400 block">Total Due in {selectedCrypto}</span>
                <div className="text-2xl lg:text-3xl font-bold font-mono tabular-nums text-amber-400 mt-1">
                  {formatCryptoAmount(cryptoAmountDue, selectedCrypto)}
                </div>
                <span className="text-xs text-zinc-500 font-mono mt-0.5 block">
                  ≈ $
                  {(cryptoPaymentType === 'deposit'
                    ? ORDER_FEE
                    : pricingBreakdown.totalPurchasePrice
                  ).toLocaleString()}{' '}
                  USD
                </span>
              </div>

              <div className="space-y-1 text-xs text-zinc-300 font-mono">
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-500">Live Rate (1 {selectedCrypto}):</span>
                  <span>${activeCryptoInfo.usdPrice.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-500">Network:</span>
                  <span>{activeCryptoInfo.network}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Rate Lock Guarantee:</span>
                  <span className="text-emerald-400">15:00 minutes guaranteed</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onInitiateOrder('crypto', selectedCrypto)}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  <span>Proceed to Crypto Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-zinc-500 text-center">
                  Direct scan QR code or connect Web3 wallet
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. CASH PAYMENT VIEW */}
        {activeTab === 'cash' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-3 text-sm">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Itemized Cost Breakdown
              </h4>

              <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-300">
                <span>Vehicle Base Price</span>
                <span className="font-mono tabular-nums">${pricingBreakdown.basePrice.toLocaleString()}</span>
              </div>

              {pricingBreakdown.paintPrice > 0 && (
                <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-300">
                  <span>Custom Exterior Paint</span>
                  <span className="font-mono tabular-nums">+${pricingBreakdown.paintPrice.toLocaleString()}</span>
                </div>
              )}

              {pricingBreakdown.wheelPrice > 0 && (
                <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-300">
                  <span>Wheel Package</span>
                  <span className="font-mono tabular-nums">+${pricingBreakdown.wheelPrice.toLocaleString()}</span>
                </div>
              )}

              {pricingBreakdown.interiorPrice > 0 && (
                <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-300">
                  <span>Premium Interior</span>
                  <span className="font-mono tabular-nums">+${pricingBreakdown.interiorPrice.toLocaleString()}</span>
                </div>
              )}

              {pricingBreakdown.softwarePrice > 0 && (
                <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-300">
                  <span>{config.fullSelfDriving ? 'Full Self-Driving (Supervised)' : 'Enhanced Autopilot'}</span>
                  <span className="font-mono tabular-nums">+${pricingBreakdown.softwarePrice.toLocaleString()}</span>
                </div>
              )}

              {pricingBreakdown.accessoriesPrice > 0 && (
                <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-300">
                  <span>Selected Charging / Tow Accessories</span>
                  <span className="font-mono tabular-nums">+${pricingBreakdown.accessoriesPrice.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-300">
                <span>Destination & Delivery Fee</span>
                <span className="font-mono tabular-nums">${DESTINATION_FEE.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-300">
                <span>Order Processing Deposit</span>
                <span className="font-mono tabular-nums">${ORDER_FEE.toLocaleString()}</span>
              </div>

              {model.federalTaxCreditEligible && (
                <div className="flex items-center justify-between py-2 text-emerald-400">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={includeTaxCredit}
                      onChange={(e) => setIncludeTaxCredit(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
                    />
                    <span>Federal Clean Vehicle Tax Credit</span>
                  </label>
                  <span className="font-mono tabular-nums">-${FEDERAL_TAX_CREDIT.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
              <div>
                <span className="text-xs text-zinc-400">Total Purchase Price</span>
                <div className="text-3xl font-bold font-mono tabular-nums text-white mt-1">
                  ${pricingBreakdown.totalPurchasePrice.toLocaleString()}
                </div>
                {includeTaxCredit && model.federalTaxCreditEligible && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ${pricingBreakdown.effectivePriceWithIncentives.toLocaleString()} after est. tax credit
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Due Today (Non-refundable):</span>
                  <span className="font-bold text-white font-mono">${ORDER_FEE}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Balance Due Prior to Delivery:</span>
                  <span className="font-mono">
                    ${(pricingBreakdown.totalPurchasePrice - ORDER_FEE).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onInitiateOrder('cash')}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-white hover:bg-zinc-200 text-zinc-950 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Reserve with $250 Order Fee</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. LOAN FINANCING VIEW */}
        {activeTab === 'loan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-5">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Financing Parameters
              </h4>

              {/* Down Payment Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Down Payment ({loanParams.downPaymentPercent}%)</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    ${loanBreakdown.downPaymentAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={loanParams.downPaymentPercent}
                  onChange={(e) =>
                    setLoanParams({ ...loanParams, downPaymentPercent: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              {/* Loan Term Selection */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-300 block">Loan Term</label>
                <div className="grid grid-cols-5 gap-2">
                  {[36, 48, 60, 72, 84].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLoanParams({ ...loanParams, termMonths: term })}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                        loanParams.termMonths === term
                          ? 'bg-zinc-100 text-zinc-900 border-white font-semibold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {term} mo
                    </button>
                  ))}
                </div>
              </div>

              {/* APR Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Interest Rate (APR)</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    {loanParams.annualInterestRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1.99"
                  max="8.99"
                  step="0.25"
                  value={loanParams.annualInterestRate}
                  onChange={(e) =>
                    setLoanParams({ ...loanParams, annualInterestRate: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <span className="text-[11px] text-zinc-500 block">
                  Promotional rates as low as 1.99% available for qualified buyers.
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
              <div>
                <span className="text-xs text-zinc-400">Estimated Monthly Loan Payment</span>
                <div className="text-3xl font-bold font-mono tabular-nums text-white mt-1">
                  ${loanBreakdown.monthlyPayment.toLocaleString()}
                  <span className="text-base text-zinc-400 font-normal"> / mo</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800 pt-4 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Financed Principal:</span>
                  <span>${loanBreakdown.principal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Est. Total Interest:</span>
                  <span>${loanBreakdown.totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Total Repayment:</span>
                  <span>${loanBreakdown.totalLoanCost.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onInitiateOrder('loan')}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-white hover:bg-zinc-200 text-zinc-950 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Apply for Tesla Financing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 4. LEASE VIEW */}
        {activeTab === 'lease' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-5">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Leasing Options
              </h4>

              <div className="space-y-2">
                <label className="text-xs text-zinc-300 block">Lease Duration</label>
                <div className="grid grid-cols-2 gap-3">
                  {[24, 36].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLeaseParams({ ...leaseParams, termMonths: term })}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                        leaseParams.termMonths === term
                          ? 'bg-zinc-100 text-zinc-900 border-white font-semibold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {term} Months
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-300 block">Annual Mileage Allowance</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10000, 12000, 15000].map((miles) => (
                    <button
                      key={miles}
                      type="button"
                      onClick={() => setLeaseParams({ ...leaseParams, annualMileage: miles })}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                        leaseParams.annualMileage === miles
                          ? 'bg-zinc-100 text-zinc-900 border-white font-semibold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {miles.toLocaleString()} mi/yr
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Down Payment (Capitalized Cost Reduction)</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    ${leaseParams.downPayment.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="8000"
                  step="500"
                  value={leaseParams.downPayment}
                  onChange={(e) =>
                    setLeaseParams({ ...leaseParams, downPayment: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
              <div>
                <span className="text-xs text-zinc-400">Estimated Monthly Lease</span>
                <div className="text-3xl font-bold font-mono tabular-nums text-white mt-1">
                  ${leaseBreakdown.monthlyPayment.toLocaleString()}
                  <span className="text-base text-zinc-400 font-normal"> / mo</span>
                </div>
                <span className="text-xs text-zinc-500 mt-1 block">
                  Excludes taxes and official fees.
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800 pt-4 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Total Due at Signing:</span>
                  <span>${leaseBreakdown.dueAtSigning.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Residual Value:</span>
                  <span>${leaseBreakdown.residualValue.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onInitiateOrder('lease')}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-white hover:bg-zinc-200 text-zinc-950 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Order with Tesla Lease</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
