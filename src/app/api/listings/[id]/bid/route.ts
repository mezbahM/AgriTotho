import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/generated/prisma';
import { ListingStatus } from '@/generated/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== UserRole.DEALER) {
        return NextResponse.json({ error: 'Unauthorized: Only dealers can place bids.' }, { status: 401 });
    }

    try {
        const { id: listingId } = params;
        const body = await req.json();
        const { bidAmount } = body;

        if (!bidAmount || typeof bidAmount !== 'number') {
            return NextResponse.json({ error: 'Invalid bid amount' }, { status: 400 });
        }

        const listing = await prisma.listing.findUnique({
            where: { id: listingId }
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        if (listing.status !== ListingStatus.ACTIVE) {
            return NextResponse.json({ error: 'This auction is not active.' }, { status: 400 });
        }

        if (bidAmount <= (listing.currentBid ?? listing.startingPrice)) {
            return NextResponse.json({ error: 'Your bid must be higher than the current price.' }, { status: 400 });
        }

        // Create a new Bid record
        // NOTE: If you get a 'Property "bid" does not exist' error, make sure you have run 'npx prisma generate' after migrating.
        await prisma.bid.create({
            data: {
                amount: bidAmount,
                listingId: listingId,
                dealerId: session.user.id
            }
        });

        // Update the listing as before
        const updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: {
                currentBid: bidAmount,
                highestBidderId: session.user.id
            }
        });

        return NextResponse.json(updatedListing);

    } catch (error) {
        console.error('[BID_POST_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 