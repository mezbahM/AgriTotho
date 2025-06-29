import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, ListingStatus } from '@/generated/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== UserRole.FARMER) {
        return NextResponse.json({ error: 'Unauthorized: Only farmers can sell listings.' }, { status: 401 });
    }

    try {
        const { id: listingId } = params;

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                farmer: true
            }
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Check if the logged-in user is the owner of the listing
        if (listing.farmerId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized: You can only sell your own listings.' }, { status: 401 });
        }

        if (listing.status !== ListingStatus.ACTIVE) {
            return NextResponse.json({ error: 'This listing is not active.' }, { status: 400 });
        }

        // Check if there are any bids on this listing
        if (!listing.highestBidderId) {
            return NextResponse.json({ error: 'Cannot sell: No bids have been placed on this listing.' }, { status: 400 });
        }

        // Update the listing to mark it as sold
        const updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: {
                status: ListingStatus.SOLD,
                finalPrice: listing.currentBid || listing.startingPrice,
            }
        });

        // Create a notification for the winning dealer
        if (listing.highestBidderId) {
            await prisma.notification.create({
                data: {
                    userId: listing.highestBidderId,
                    type: 'WIN',
                    message: `Congratulations! You have won the auction for ${listing.cropName}. Download your cash memo.`,
                    listingId: listing.id,
                }
            });
        }

        return NextResponse.json(updatedListing);

    } catch (error) {
        console.error('[SELL_POST_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 