'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import LanguageSwitch from '@/components/LanguageSwitch';
import { useLanguage } from '@/contexts/LanguageContext';
import { Listing, User } from '@/generated/prisma';
import EditCropModal from '@/components/marketplace/EditCropModal';

type ListingDetails = Listing & {
    farmer: Pick<User, 'name' | 'image'>;
};

export default function ListingDetailsPage() {
    const { language, translations } = useLanguage();
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    // All hooks must be called before any conditional return
    const [listing, setListing] = useState<ListingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const [bidError, setBidError] = useState<string | null>(null);
    const [isBidding, setIsBidding] = useState(false);
    // Debug state
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [formattedEndTime, setFormattedEndTime] = useState('');

    const t = (key: string, fallback: string) => translations[key]?.[language] || fallback;

    const fetchListingDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/listings/${id}`);
            const data = await response.json();
            setApiResponse(data); // Save raw API response for debug
            if (!response.ok) {
                throw new Error('Failed to fetch listing details');
            }
            setListing(data);
            // Fetch all bids for this listing if the user is the owner
            if (session?.user?.id && data.farmerId === session.user.id) {
                const bidsResponse = await fetch(`/api/listings/${id}/bids`);
                const bidsData = await bidsResponse.json();
                setBids(bidsData);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (id) {
            fetchListingDetails();
        }
    }, [id]);

    useEffect(() => {
      if (listing && listing.endTime) {
        setFormattedEndTime(new Date(listing.endTime).toLocaleString());
      }
    }, [listing?.endTime]);

    const handleListingUpdated = () => {
        fetchListingDetails();
    };
    
    // Debug output at the top of the page
    if (loading) return <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fcf8] text-[#111b0e]">
        <div>Loading...</div>
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-700">
            <div><b>Debug Info</b></div>
            <div>id: {id}</div>
            <div>session: {JSON.stringify(session)}</div>
        </div>
    </div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fcf8] text-red-500">
        <div>Error: {error}</div>
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-700">
            <div><b>Debug Info</b></div>
            <div>id: {id}</div>
            <div>session: {JSON.stringify(session)}</div>
            <div>apiResponse: {JSON.stringify(apiResponse)}</div>
        </div>
    </div>;
    if (!listing) return <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fcf8] text-[#111b0e]">
        <div>Listing not found.</div>
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-700">
            <div><b>Debug Info</b></div>
            <div>id: {id}</div>
            <div>session: {JSON.stringify(session)}</div>
            <div>apiResponse: {JSON.stringify(apiResponse)}</div>
        </div>
    </div>;

    const isOwner = session?.user?.id === listing.farmerId;
    const canEdit = isOwner && listing.status === 'ACTIVE';
    const isDealer = session?.user?.role === 'DEALER' && listing.status === 'ACTIVE';

    const handlePlaceBid = async () => {
        if (!isDealer) return;
        
        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount <= (listing.currentBid ?? listing.startingPrice)) {
            setBidError(t('details.bidError', 'Your bid must be a number higher than the current bid.'));
            return;
        }

        setIsBidding(true);
        setBidError(null);

        try {
            const response = await fetch(`/api/listings/${id}/bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bidAmount: amount }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to place bid.');
            }

            setBidAmount('');
            fetchListingDetails(); // Refresh details to show new bid
        } catch (err: any) {
            setBidError(err.message);
        } finally {
            setIsBidding(false);
        }
    };

    return (
        <>
            <div className="relative flex size-full min-h-screen flex-col bg-[#f9fcf8] group/design-root overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    <div className="gap-1 px-6 flex flex-1 justify-center py-5">
                        <Sidebar />
                        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                            <div className="flex flex-wrap justify-between items-center gap-3 p-4">
                                <h1 className="text-[#111b0e] tracking-light text-[32px] font-bold leading-tight min-w-72">
                                    {t('details.title', 'Listing Details')}
                                </h1>
                                <LanguageSwitch />
                            </div>

                            <div className="p-4 space-y-6">
                                <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{listing.cropName}</h2>
                                            <p className="text-sm text-gray-500">{t('details.listedBy', 'Listed by')}: {listing.farmer.name}</p>
                                        </div>
                                        {canEdit && (
                                            <button 
                                                onClick={() => setIsEditModalOpen(true)}
                                                className="px-4 py-2 bg-[#3db714] text-white rounded-lg hover:bg-[#2f8f0f] transition-colors"
                                            >
                                                {t('details.edit', 'Edit')}
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="font-medium text-gray-600">{t('details.quantity', 'Quantity')}</p>
                                            <p className="text-gray-900">{listing.quantity} {listing.unit}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">{t('details.startingPrice', 'Starting Price')}</p>
                                            <p className="text-gray-900">{listing.startingPrice} BDT/{listing.unit}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">{t('details.currentBid', 'Current Bid')}</p>
                                            <p className="text-gray-900 font-semibold">{listing.currentBid || listing.startingPrice} BDT/{listing.unit}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">{t('details.status', 'Status')}</p>
                                            <p className="text-gray-900">{listing.status}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">{t('details.endTime', 'Auction Ends')}</p>
                                            <p className="text-gray-900">{listing.endTime ? formattedEndTime : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-600">{t('details.description', 'Description')}</p>
                                        <p className="text-gray-800 mt-1">{listing.description}</p>
                                    </div>
                                </div>
                                
                                {isDealer && (
                                     <div className="bg-white rounded-lg shadow-sm p-6 space-y-3">
                                        <h3 className="text-lg font-bold text-gray-900">{t('details.placeBidTitle', 'Place Your Bid')}</h3>
                                        {bidError && <p className="text-sm text-red-600">{bidError}</p>}
                                        <div className="flex gap-2">
                                            <input 
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                placeholder={t('details.bidPlaceholder', 'Enter your bid amount')}
                                                className="flex-grow p-2 border rounded-md text-[#111b0e] placeholder:text-[#111b0e]"
                                                disabled={isBidding}
                                            />
                                            <button 
                                                onClick={handlePlaceBid}
                                                disabled={isBidding}
                                                className="px-6 py-2 bg-[#3db714] text-white rounded-lg hover:bg-[#2f8f0f] transition-colors disabled:bg-gray-400"
                                            >
                                                {isBidding ? t('details.bidding', 'Bidding...') : t('details.placeBid', 'Place Bid')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {isOwner && (
                                    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Dealer Offers</h3>
                                        {bids.length === 0 ? (
                                            <p className="text-gray-500">No dealer offers yet.</p>
                                        ) : (
                                            <table className="min-w-full bg-white rounded-lg shadow-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealer Name</th>
                                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bids.map((bid, idx) => (
                                                        <tr key={idx}>
                                                            <td className="p-4 whitespace-nowrap text-sm text-gray-900">{bid.dealer?.name || '-'}</td>
                                                            <td className="p-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{bid.amount}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {listing && canEdit && (
                <EditCropModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onListingUpdated={handleListingUpdated}
                    listing={listing}
                />
            )}
        </>
    );
} 