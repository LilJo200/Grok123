import React, { useState, useEffect } from 'react';
import { CryptoCurrencyCode, CustomerOrder } from '../types/tesla';
import {
  SUPPORTED_CRYPTO_CURRENCIES,
  convertUsdToCrypto,
  generateSimulatedTxHash,
  generateCryptoUri,
} from '../data/cryptoRates';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Wallet,
  Clock,
  ArrowRight,
  AlertCircle,
  QrCode,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface CryptoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  usdAmount: number;
  initialCryptoCode?: CryptoCurrencyCode;
  modelName: string;
  onPaymentSuccess: (details: {
    code: CryptoCurrencyCode;
    amount: number;
    txHash: string;
    rateUsd: number;
  }) => void;
}

export const CryptoCheckoutModal: React.FC<CryptoCheckoutModalProps> = ({
  isOpen,
  onClose,
  usdAmount,
  initialCryptoCode = 'BTC',
  modelName,
  onPaymentSuccess,
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrencyCode>(initialCryptoCode);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900); // 15 mins lock
  const [step, setStep] = useState<'pay' | 'broadcasting' | 'confirming' | 'confirmed'>('pay');
  const [txHash, setTxHash] = useState('');
  const [web3WalletConnected, setWeb3WalletConnected] = useState(false);

  const cryptoInfo = SUPPORTED_CRYPTO_CURRENCIES[selectedCrypto];
  const cryptoAmount = convertUsdToCrypto(usdAmount, selectedCrypto);

  // Countdown timer for rate lock
  useEffect(() => {
    if (!isOpen || step !== 'pay') return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(cryptoInfo.depositAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard?.writeText(cryptoAmount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleConnectWallet = () => {
    setWeb3WalletConnected(true);
  };

  const handleSimulatePayment = () => {
    setStep('broadcasting');
    const hash = generateSimulatedTxHash(selectedCrypto);
    setTxHash(hash);

    setTimeout(() => {
      setStep('confirming');
      setTimeout(() => {
        setStep('confirmed');
        onPaymentSuccess({
          code: selectedCrypto,
          amount: cryptoAmount,
          txHash: hash,
          rateUsd: cryptoInfo.usdPrice,
        });
      }, 2000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#121317] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-black"
              style={{ backgroundColor: cryptoInfo.iconColor }}
            >
              {cryptoInfo.symbol}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Tesla Digital Asset Checkout
              </h3>
              <p className="text-xs text-zinc-400">
                {modelName} · ${usdAmount.toLocaleString()} USD Total
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

        {/* Currency Selector Pill Bar */}
        {step === 'pay' && (
          <div className="px-6 pt-4 flex items-center gap-2 overflow-x-auto pb-1">
            {(Object.keys(SUPPORTED_CRYPTO_CURRENCIES) as CryptoCurrencyCode[]).map((code) => {
              const info = SUPPORTED_CRYPTO_CURRENCIES[code];
              const isSelected = selectedCrypto === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedCrypto(code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
                    isSelected
                      ? 'bg-zinc-800 text-white border-amber-500/50 shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: info.iconColor }}
                  />
                  <span>{code}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Body based on step */}
        <div className="p-6">
          {step === 'pay' && (
            <div className="space-y-6">
              {/* Rate Lock Timer banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>Guaranteed Price Lock:</span>
                </div>
                <div className="font-mono tabular-nums font-bold text-amber-400">
                  {formatTimer(timeLeftSeconds)} Remaining
                </div>
              </div>

              {/* QR Code and Amount Display */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                {/* SVG Rendered Dynamic QR Code */}
                <div className="p-3 bg-white rounded-xl shadow-md shrink-0 flex flex-col items-center justify-center">
                  <svg
                    viewBox="0 0 140 140"
                    width="128"
                    height="128"
                    className="w-32 h-32"
                  >
                    {/* QR Code Pattern Matrix representation */}
                    <rect width="140" height="140" fill="#ffffff" />
                    {/* Top-left position marker */}
                    <rect x="10" y="10" width="35" height="35" fill="#000000" />
                    <rect x="15" y="15" width="25" height="25" fill="#ffffff" />
                    <rect x="20" y="20" width="15" height="15" fill="#000000" />

                    {/* Top-right position marker */}
                    <rect x="95" y="10" width="35" height="35" fill="#000000" />
                    <rect x="100" y="15" width="25" height="25" fill="#ffffff" />
                    <rect x="105" y="20" width="15" height="15" fill="#000000" />

                    {/* Bottom-left position marker */}
                    <rect x="10" y="95" width="35" height="35" fill="#000000" />
                    <rect x="15" y="100" width="25" height="25" fill="#ffffff" />
                    <rect x="20" y="105" width="15" height="15" fill="#000000" />

                    {/* Dynamic QR data blocks */}
                    <rect x="52" y="14" width="8" height="8" fill="#000000" />
                    <rect x="68" y="14" width="8" height="8" fill="#000000" />
                    <rect x="60" y="30" width="12" height="12" fill="#000000" />
                    <rect x="76" y="26" width="8" height="8" fill="#000000" />

                    <rect x="14" y="54" width="8" height="8" fill="#000000" />
                    <rect x="30" y="58" width="8" height="8" fill="#000000" />
                    <rect x="50" y="52" width="10" height="10" fill="#000000" />
                    <rect x="70" y="50" width="16" height="8" fill="#000000" />
                    <rect x="92" y="54" width="12" height="12" fill="#000000" />
                    <rect x="114" y="58" width="8" height="8" fill="#000000" />

                    <rect x="54" y="70" width="8" height="18" fill="#000000" />
                    <rect x="70" y="68" width="12" height="12" fill="#000000" />
                    <rect x="90" y="74" width="16" height="8" fill="#000000" />
                    <rect x="112" y="70" width="8" height="12" fill="#000000" />

                    <rect x="52" y="96" width="16" height="8" fill="#000000" />
                    <rect x="74" y="92" width="8" height="14" fill="#000000" />
                    <rect x="90" y="96" width="12" height="12" fill="#000000" />
                    <rect x="110" y="94" width="14" height="8" fill="#000000" />

                    <rect x="58" y="114" width="12" height="12" fill="#000000" />
                    <rect x="80" y="116" width="8" height="8" fill="#000000" />
                    <rect x="96" y="114" width="14" height="12" fill="#000000" />
                    <rect x="118" y="112" width="8" height="14" fill="#000000" />

                    {/* Tesla Badge in QR Center */}
                    <circle cx="70" cy="70" r="14" fill="#ffffff" stroke="#e4e4e7" strokeWidth="2" />
                    <path
                      d="M 70 63 L 66 72 L 74 72 Z"
                      fill="#e11d48"
                    />
                  </svg>
                  <span className="text-[10px] text-zinc-600 mt-1 font-semibold uppercase tracking-wider">
                    Scan to Pay
                  </span>
                </div>

                {/* Amount & Network instructions */}
                <div className="flex-1 w-full space-y-3">
                  <div>
                    <span className="text-xs text-zinc-400">Send Exact Amount:</span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                        {cryptoAmount} {selectedCrypto}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyAmount}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 transition-colors"
                        title="Copy Amount"
                      >
                        {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[11px]">{copiedAmount ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">
                      1 {selectedCrypto} = ${cryptoInfo.usdPrice.toLocaleString()} USD
                    </span>
                  </div>

                  {/* Network Notice */}
                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Network:</span>
                      <span className="font-semibold text-white">{cryptoInfo.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Est. Network Gas:</span>
                      <span className="text-emerald-400">~${cryptoInfo.recommendedFeeUsd} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Address Box */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Official Tesla {selectedCrypto} Vault Address
                </label>
                <div className="flex items-center gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-300 break-all">
                  <span className="flex-1">{cryptoInfo.depositAddress}</span>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors shrink-0 flex items-center gap-1 text-xs"
                  >
                    {copiedAddress ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons: Web3 Wallet vs Simulated Broadcast */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                      web3WalletConnected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>
                      {web3WalletConnected
                        ? 'MetaMask / Wallet Connected'
                        : 'Connect Web3 Wallet'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="py-3 px-4 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Confirm Transfer</span>
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 text-center">
                  Transactions are monitored continuously on-chain. Zero hidden conversions or foreign exchange fees.
                </p>
              </div>
            </div>
          )}

          {/* BROADCASTING / CONFIRMING / CONFIRMED STATES */}
          {step === 'broadcasting' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <RefreshCw className="w-12 h-12 text-amber-400 animate-spin" />
              <div>
                <h4 className="text-base font-bold text-white">Detecting On-Chain Broadcast</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Listening to {cryptoInfo.network} mempool for incoming transaction of {cryptoAmount} {selectedCrypto}...
                </p>
              </div>
              <div className="font-mono text-xs text-zinc-500 break-all max-w-md p-2 bg-zinc-900 rounded border border-zinc-800">
                Tx: {txHash}
              </div>
            </div>
          )}

          {step === 'confirming' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin" />
              <div>
                <h4 className="text-base font-bold text-white">Confirming Block Verification (1/3)</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Cryptographic proofs verified on {cryptoInfo.network}. Finalizing Tesla reservation...
                </p>
              </div>
              <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-cyan-400 animate-pulse" />
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Cryptocurrency Payment Confirmed!</h4>
                <p className="text-xs text-zinc-300 mt-1 max-w-md">
                  Received {cryptoAmount} {selectedCrypto} ($
                  {usdAmount.toLocaleString()} USD equivalent). Your transaction has settled on the {cryptoInfo.network}.
                </p>
              </div>

              <div className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Transaction Hash:</span>
                  <span className="text-emerald-400 truncate max-w-[220px]">{txHash}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">Confirmed (Finalized)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Block Height:</span>
                  <span className="text-zinc-200">#891,421</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-colors"
              >
                View Vehicle Order Reservation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
