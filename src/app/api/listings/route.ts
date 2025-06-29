import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/generated/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const history = searchParams.get('history');
  
  // If history=dealer, return buying history for dealers
  if (history === 'dealer') {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.DEALER) {
      return NextResponse.json({ error: 'Unauthorized: Only dealers can view buying history.' }, { status: 401 });
    }
    
    console.log('[BUYING_HISTORY_DEBUG]', {
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role
    });
    
    try {
      const listings = await prisma.listing.findMany({
        where: {
          highestBidderId: session.user.id,
          // Show all listings where dealer is highest bidder, not just SOLD ones
          status: {
            in: ['ACTIVE', 'SOLD', 'EXPIRED']
          },
        },
        include: {
          farmer: {
            select: {
              name: true,
              image: true,
            }
          }
        },
        orderBy: {
          endTime: 'desc',
        },
      });
      
      console.log('[BUYING_HISTORY_RESULT]', {
        totalListings: listings.length,
        listings: listings.map(l => ({
          id: l.id,
          cropName: l.cropName,
          status: l.status,
          highestBidderId: l.highestBidderId,
          currentBid: l.currentBid,
          startingPrice: l.startingPrice
        }))
      });
      
      return NextResponse.json(listings);
    } catch (error) {
      console.error('[BUYING_HISTORY_GET_ERROR]', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }
  
  // Default: return all listings for the logged-in farmer if farmer, otherwise only ACTIVE
  const session = await getServerSession(authOptions);
  if (session?.user?.role === UserRole.FARMER) {
    const listings = await prisma.listing.findMany({
      where: {
        farmerId: session.user.id,
      },
      include: {
        farmer: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(listings);
  }
  // Default for others: only ACTIVE
  const listings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      farmer: {
        select: {
          name: true,
          image: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    
    console.log('[API_SESSION_DEBUG]', {
        session: session,
        userId: session?.user?.id,
        userRole: session?.user?.role,
        hasId: !!session?.user?.id,
        hasRole: !!session?.user?.role,
        isFarmer: session?.user?.role === UserRole.FARMER,
        sessionKeys: session ? Object.keys(session) : 'no session',
        userKeys: session?.user ? Object.keys(session.user) : 'no user'
    });

    // Temporary workaround - let's try to get the user from the database based on email
    if (!session?.user?.id && session?.user?.email) {
        console.log('[API_TEMP_WORKAROUND] Trying to find user by email:', session.user.email);
        try {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email }
            });
            if (user && user.role === UserRole.FARMER) {
                console.log('[API_TEMP_WORKAROUND] Found user:', user.id, user.role);
                // Continue with the request using the found user
            } else {
                return NextResponse.json({ error: 'Unauthorized: Only farmers can create listings.' }, { status: 401 });
            }
        } catch (error) {
            console.error('[API_TEMP_WORKAROUND_ERROR]', error);
        }
    }

    if (!session?.user?.id || session.user.role !== UserRole.FARMER) {
        return NextResponse.json({ error: 'Unauthorized: Only farmers can create listings.' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { cropName, quantity, unit, startingPrice, description, endTime } = body;

        if (!cropName || !quantity || !unit || !startingPrice) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newListing = await prisma.listing.create({
            data: {
                cropName,
                quantity,
                unit,
                startingPrice,
                description: description || '',
                currentBid: startingPrice,
                endTime: endTime ? new Date(endTime) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                farmerId: session.user.id,
            },
        });

        return NextResponse.json(newListing, { status: 201 });

    } catch (error) {
        console.error('[LISTING_POST_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 