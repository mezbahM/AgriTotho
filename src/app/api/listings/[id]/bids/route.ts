import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const bids = await prisma.bid.findMany({
      where: { listingId: params.id },
      include: {
        dealer: {
          select: {
            name: true,
            address: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(bids);
  } catch (error) {
    console.error('[BIDS_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 