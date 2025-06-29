import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/generated/prisma';

// GET a single listing
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        farmer: {
          select: { name: true, image: true }
        }
      }
    });

    if (!listing) {
      return new NextResponse('Listing not found', { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error(`[LISTING_GET_ERROR]`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


// UPDATE a listing
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== UserRole.FARMER) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing || listing.farmerId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await req.json();
    const { cropName, quantity, unit, startingPrice, description } = body;

    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        cropName,
        quantity,
        unit,
        startingPrice,
        description,
      },
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error(`[LISTING_PUT_ERROR]`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE a listing
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== UserRole.FARMER) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing || listing.farmerId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.listing.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[LISTING_DELETE_ERROR]`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 