const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const auctions = await p.auction.updateMany({
    data: {
      status: 'SCHEDULED',
      actualStart: null,
      actualEnd: null,
      winningBidderId: null,
      finalPrice: null,
      extensionCount: 0,
    },
  });
  console.log('Auctions reset:', auctions.count);

  const listings = await p.listing.updateMany({
    where: { status: { in: ['UNSOLD', 'CANCELLED', 'AUCTION_LIVE', 'AUCTION_SCHEDULED', 'SOLD'] } },
    data: { status: 'APPROVED' },
  });
  console.log('Listings reset:', listings.count);

  // Also clear any EMDs so we start fresh
  const emds = await p.emd.updateMany({
    where: { status: 'REFUNDED' },
    data: { status: 'HELD' },
  });
  console.log('EMDs re-held:', emds.count);
}

main().catch(console.error).finally(() => p.$disconnect());
