import { CryptoCurrency, CryptoCurrencyCode } from '../types/tesla';

export const SUPPORTED_CRYPTO_CURRENCIES: Record<CryptoCurrencyCode, CryptoCurrency> = {
  BTC: {
    code: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    usdPrice: 96450,
    network: 'Bitcoin Native (SegWit)',
    recommendedFeeUsd: 4.5,
    depositAddress: 'bc1qtes1a3ngin33r1ngc0rppaym3ntvaul7x982z',
    iconColor: '#f7931a',
    precision: 6,
  },
  ETH: {
    code: 'ETH',
    name: 'Ethereum',
    symbol: 'Ξ',
    usdPrice: 3420,
    network: 'Ethereum Mainnet (ERC-20)',
    recommendedFeeUsd: 6.2,
    depositAddress: '0x32A462B2F49788dE8a088E237f3a8b278912E3cE',
    iconColor: '#627eea',
    precision: 5,
  },
  DOGE: {
    code: 'DOGE',
    name: 'Dogecoin',
    symbol: 'Ð',
    usdPrice: 0.245,
    network: 'Dogecoin Blockchain',
    recommendedFeeUsd: 0.15,
    depositAddress: 'D8esLaM0b1l1tyPayVaultXDog3Coin4EvEr99',
    iconColor: '#c2a633',
    precision: 2,
  },
  SOL: {
    code: 'SOL',
    name: 'Solana',
    symbol: '◎',
    usdPrice: 218,
    network: 'Solana Mainnet-Beta',
    recommendedFeeUsd: 0.005,
    depositAddress: 'TesLaPaySo1anaVaulTX9999999999999999999999999',
    iconColor: '#14f195',
    precision: 4,
  },
  USDT: {
    code: 'USDT',
    name: 'Tether USD',
    symbol: '₮',
    usdPrice: 1.0,
    network: 'Ethereum (ERC-20) / Arbitrum',
    recommendedFeeUsd: 2.0,
    depositAddress: '0x71C8A5634568856e7912445E3589B7203E798363',
    iconColor: '#26a17b',
    precision: 2,
  },
};

export function convertUsdToCrypto(usdAmount: number, code: CryptoCurrencyCode): number {
  const currency = SUPPORTED_CRYPTO_CURRENCIES[code];
  if (!currency || currency.usdPrice <= 0) return 0;
  const raw = usdAmount / currency.usdPrice;
  const factor = Math.pow(10, currency.precision);
  return Math.round(raw * factor) / factor;
}

export function formatCryptoAmount(amount: number, code: CryptoCurrencyCode): string {
  const currency = SUPPORTED_CRYPTO_CURRENCIES[code];
  if (!currency) return amount.toString();
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: Math.min(2, currency.precision),
    maximumFractionDigits: currency.precision,
  })} ${code}`;
}

export function generateCryptoUri(code: CryptoCurrencyCode, amount: number): string {
  const currency = SUPPORTED_CRYPTO_CURRENCIES[code];
  switch (code) {
    case 'BTC':
      return `bitcoin:${currency.depositAddress}?amount=${amount}&label=TeslaOrder`;
    case 'ETH':
      return `ethereum:${currency.depositAddress}?value=${amount}`;
    case 'DOGE':
      return `dogecoin:${currency.depositAddress}?amount=${amount}`;
    case 'SOL':
      return `solana:${currency.depositAddress}?amount=${amount}`;
    case 'USDT':
      return `ethereum:${currency.depositAddress}?value=${amount}&token=USDT`;
    default:
      return `${currency.depositAddress}`;
  }
}

export function generateSimulatedTxHash(code: CryptoCurrencyCode): string {
  const hexChars = '0123456789abcdef';
  let hash = '';
  if (code === 'BTC' || code === 'DOGE') {
    for (let i = 0; i < 64; i++) {
      hash += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
  } else if (code === 'SOL') {
    const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    for (let i = 0; i < 88; i++) {
      hash += base58[Math.floor(Math.random() * base58.length)];
    }
  } else {
    hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
  }
  return hash;
}
