// Module-level singleton — Node.js caches this, so both AuctionsService
// and AuctionGateway reference the exact same Map instance.
export const auctionState = new Map<string, string>();
