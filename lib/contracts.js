// ─────────────────────────────────────────────────────────────
//  lib/contracts.js
//  Isi address setelah deploy, lalu tidak perlu ubah lagi
// ─────────────────────────────────────────────────────────────

// Base Sepolia testnet USDC (Circle)
export const USDC_ADDRESS     = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Ganti setelah deploy
export const GUSDC_ADDRESS    = "0x797DAA581768890caB8Eadcc446E9C1B645F4bC6";
export const TREASURY_ADDRESS = "0x688be419Aa84fF27Ae2a479B88931aa2Af53A7D1";
export const FAUCET_ADDRESS   = "0x400F64eaEa1E9eBdBA228600ba070d718Fc96F85";
export const COINFLIP_ADDRESS = "0xC9DdD7bE0f3b5664e98F26df5dD702b47b8e2E46";
export const DICE_ADDRESS     = "0x25fF5f7295Dd766B5c79BC6BA3b711B108F0B3E6";
export const SLOTS_ADDRESS    = "0x4D4b36Eaa83F60612aCBe188ED3c9eA22e74839b";

export const CHAIN_ID = 84532; // Base Sepolia

// ─────────────────────────────────────────────────────────────
//  ERC-20 ABI (USDC & gUSDC)
// ─────────────────────────────────────────────────────────────
export const ERC20_ABI = [
  { name: "balanceOf",   type: "function", stateMutability: "view",       inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "allowance",   type: "function", stateMutability: "view",       inputs: [{ name: "owner",   type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "approve",     type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount",  type: "uint256" }], outputs: [{ type: "bool" }] },
  { name: "transfer",    type: "function", stateMutability: "nonpayable", inputs: [{ name: "to",      type: "address" }, { name: "amount",  type: "uint256" }], outputs: [{ type: "bool" }] },
  { name: "totalSupply", type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "decimals",    type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint8"   }] },
];

// ─────────────────────────────────────────────────────────────
//  TREASURY ABI
// ─────────────────────────────────────────────────────────────
export const TREASURY_ABI = [
  // Player
  { name: "deposit",  type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { name: "withdraw", type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },

  // Owner — bankroll
  { name: "injectLiquidity",    type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { name: "removeLiquidity",    type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { name: "withdrawFees",       type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "withdrawFeesPartial",type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { name: "authorizeGame",      type: "function", stateMutability: "nonpayable", inputs: [{ name: "game", type: "address" }, { name: "status", type: "bool" }], outputs: [] },
  { name: "setPaused",          type: "function", stateMutability: "nonpayable", inputs: [{ name: "v",      type: "bool"    }], outputs: [] },
  { name: "setDepositFee",      type: "function", stateMutability: "nonpayable", inputs: [{ name: "bps",    type: "uint256" }], outputs: [] },
  { name: "setWithdrawFee",     type: "function", stateMutability: "nonpayable", inputs: [{ name: "bps",    type: "uint256" }], outputs: [] },
  { name: "setMaxPayoutBps",    type: "function", stateMutability: "nonpayable", inputs: [{ name: "bps",    type: "uint256" }], outputs: [] },

  // Views
  { name: "bankrollBalance", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "netBankroll",     type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "maxPayoutAmount", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "paused",          type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool"    }] },
  { name: "depositFeeBps",   type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "withdrawFeeBps",  type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "maxPayoutBps",    type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "accumulatedFees", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "minDeposit",      type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "maxDeposit",      type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    name: "getStats", type: "function", stateMutability: "view", inputs: [],
    outputs: [
      { name: "bankroll",   type: "uint256" },
      { name: "net",        type: "uint256" },
      { name: "deposited",  type: "uint256" },
      { name: "withdrawn",  type: "uint256" },
      { name: "bets",       type: "uint256" },
      { name: "payouts",    type: "uint256" },
      { name: "fees",       type: "uint256" },
      { name: "maxPayout",  type: "uint256" },
    ],
  },
  { name: "authorizedGames", type: "function", stateMutability: "view", inputs: [{ name: "game", type: "address" }], outputs: [{ type: "bool" }] },

  // Events
  { name: "Deposited",        type: "event", inputs: [{ name: "player", type: "address", indexed: true }, { name: "usdcIn",   type: "uint256", indexed: false }, { name: "gusdcOut", type: "uint256", indexed: false }, { name: "fee", type: "uint256", indexed: false }] },
  { name: "Withdrawn",        type: "event", inputs: [{ name: "player", type: "address", indexed: true }, { name: "gusdcIn",  type: "uint256", indexed: false }, { name: "usdcOut",  type: "uint256", indexed: false }, { name: "fee", type: "uint256", indexed: false }] },
  { name: "LiquidityInjected",type: "event", inputs: [{ name: "amount", type: "uint256", indexed: false }, { name: "newBankroll", type: "uint256", indexed: false }] },
  { name: "LiquidityRemoved", type: "event", inputs: [{ name: "amount", type: "uint256", indexed: false }, { name: "newBankroll", type: "uint256", indexed: false }] },
  { name: "FeesWithdrawn",    type: "event", inputs: [{ name: "amount", type: "uint256", indexed: false }] },
];

// ─────────────────────────────────────────────────────────────
//  FAUCET ABI
// ─────────────────────────────────────────────────────────────
export const FAUCET_ABI = [
  { name: "claimFaucet",  type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "topUp",        type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { name: "canClaim",     type: "function", stateMutability: "view",       inputs: [{ name: "player", type: "address" }], outputs: [{ type: "bool"    }] },
  { name: "nextClaimTime",type: "function", stateMutability: "view",       inputs: [{ name: "player", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "timeLeft",     type: "function", stateMutability: "view",       inputs: [{ name: "player", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "faucetBalance",type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "claimAmount",  type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "cooldown",     type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "paused",       type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "bool"    }] },
  { name: "lastClaim",    type: "function", stateMutability: "view",       inputs: [{ name: "player", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "Claimed",      type: "event",    inputs: [{ name: "player", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }, { name: "nextClaimAt", type: "uint256", indexed: false }] },
];

// ─────────────────────────────────────────────────────────────
//  COINFLIP ABI
// ─────────────────────────────────────────────────────────────
export const COINFLIP_ABI = [
  { name: "flip",          type: "function", stateMutability: "nonpayable", inputs: [{ name: "betAmount", type: "uint256" }, { name: "isHeads", type: "bool" }], outputs: [] },
  { name: "minBet",        type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "maxBet",        type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "paused",        type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "bool"    }] },
  { name: "payoutMultX100",type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "nonces",        type: "function", stateMutability: "view",       inputs: [{ name: "player", type: "address" }], outputs: [{ type: "uint256" }] },
  {
    name: "FlipResult", type: "event",
    inputs: [
      { name: "player",       type: "address", indexed: true  },
      { name: "resultHeads",  type: "bool",    indexed: false },
      { name: "playerHeads",  type: "bool",    indexed: false },
      { name: "won",          type: "bool",    indexed: false },
      { name: "betAmount",    type: "uint256", indexed: false },
      { name: "payoutAmount", type: "uint256", indexed: false },
      { name: "nonce",        type: "uint256", indexed: false },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  DICE ABI
// ─────────────────────────────────────────────────────────────
export const DICE_ABI = [
  { name: "roll",          type: "function", stateMutability: "nonpayable", inputs: [{ name: "betAmount", type: "uint256" }, { name: "isHigh", type: "bool" }], outputs: [] },
  { name: "minBet",        type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "maxBet",        type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "paused",        type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "bool"    }] },
  { name: "payoutMultX100",type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "nonces",        type: "function", stateMutability: "view",       inputs: [{ name: "player", type: "address" }], outputs: [{ type: "uint256" }] },
  {
    name: "DiceResult", type: "event",
    inputs: [
      { name: "player",       type: "address", indexed: true  },
      { name: "diceValue",    type: "uint8",   indexed: false },
      { name: "isHigh",       type: "bool",    indexed: false },
      { name: "won",          type: "bool",    indexed: false },
      { name: "betAmount",    type: "uint256", indexed: false },
      { name: "payoutAmount", type: "uint256", indexed: false },
      { name: "nonce",        type: "uint256", indexed: false },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  SLOTS ABI
// ─────────────────────────────────────────────────────────────
export const SLOTS_ABI = [
  { name: "spin",   type: "function", stateMutability: "nonpayable", inputs: [{ name: "betAmount", type: "uint256" }], outputs: [] },
  { name: "minBet", type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "maxBet", type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "uint256" }] },
  { name: "paused", type: "function", stateMutability: "view",       inputs: [], outputs: [{ type: "bool"    }] },
  { name: "nonces", type: "function", stateMutability: "view",       inputs: [{ name: "player", type: "address" }], outputs: [{ type: "uint256" }] },
  {
    name: "SpinResult", type: "event",
    inputs: [
      { name: "player",         type: "address", indexed: true  },
      { name: "reel0",          type: "uint8",   indexed: false },
      { name: "reel1",          type: "uint8",   indexed: false },
      { name: "reel2",          type: "uint8",   indexed: false },
      { name: "multiplierX100", type: "uint256", indexed: false },
      { name: "betAmount",      type: "uint256", indexed: false },
      { name: "payoutAmount",   type: "uint256", indexed: false },
      { name: "nonce",          type: "uint256", indexed: false },
    ],
  },
];

export const MAX_UINT = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
