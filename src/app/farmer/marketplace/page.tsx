'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import LanguageSwitch from '@/components/LanguageSwitch';
import { useLanguage } from '@/contexts/LanguageContext';
import AddCropModal from '@/components/marketplace/AddCropModal';
import { Listing } from '@/generated/prisma';

type EnrichedListing = Listing & {
  farmer: {
    name: string | null;
  };
};

export default function MarketplacePage() {
  const { language, translations } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('myListings');
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const t = (key: string, fallback: string) => translations[key]?.[language] || fallback;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchListings();
    }
  }, [status, router]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/listings');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const allListings = await response.json();
      // Filter listings by the logged-in farmer
      const userListings = allListings.filter(
        (listing: EnrichedListing) => listing.farmerId === session?.user?.id
      );
      setListings(userListings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleListingAdded = () => {
    fetchListings(); // Refresh the list after adding
  };

  const handleRemoveListing = async (id: string) => {
    if (!confirm(t('marketplace.confirmRemove', 'Are you sure you want to remove this listing?'))) return;

    try {
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove listing.');
      }
      
      fetchListings(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSellListing = async (id: string) => {
    if (!confirm(t('marketplace.confirmSell', 'Are you sure you want to sell this crop to the highest bidder?'))) return;

    try {
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(`/api/listings/${id}/sell`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sell listing.');
      }
      
      setSuccessMessage(t('marketplace.sellSuccess', 'Crop sold successfully!'));
      fetchListings(); // Refresh list
      
      // Switch to completed sales tab to show the sold listing
      setActiveTab('completedSales');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  const completedListings = listings.filter(l => l.status === 'SOLD' || l.status === 'EXPIRED');
  
  const renderTable = (data: EnrichedListing[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('marketplace.crop', 'Crop')}</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('marketplace.quantity', 'Quantity')}</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('marketplace.price', 'Price')}</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {activeTab === 'myListings' ? t('marketplace.currentPrice', 'Current Price') : t('marketplace.salePrice', 'Sale Price')}
            </th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('marketplace.status', 'Status')}</th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('marketplace.actions', 'Actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((listing) => (
            <tr key={listing.id}>
              <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">{listing.cropName}</td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-500">{`${listing.quantity} ${listing.unit}`}</td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-500">{`${listing.startingPrice} BDT/${listing.unit}`}</td>
              <td className="p-4 whitespace-nowrap text-sm">
                {activeTab === 'myListings' ? (
                  <>
                    <span className={listing.highestBidderId ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                      {`${listing.currentBid || listing.startingPrice} BDT/${listing.unit}`}
                    </span>
                    {listing.highestBidderId && (
                      <span className="ml-2 text-xs text-green-600">(Has bids)</span>
                    )}
                  </>
                ) : (
                  <span className="text-green-600 font-semibold">
                    {`${listing.finalPrice || listing.currentBid || listing.startingPrice} BDT/${listing.unit}`}
                  </span>
                )}
              </td>
              <td className="p-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                  listing.status === 'SOLD' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {listing.status}
                </span>
              </td>
              <td className="p-4 whitespace-nowrap text-sm font-medium">
                <button onClick={() => router.push(`/farmer/marketplace/${listing.id}`)} className="text-[#3db714] hover:text-[#2f8f0f] mr-4">{t('marketplace.viewDetails', 'View Details')}</button>
                {listing.status === 'ACTIVE' && (
                  <>
                    {listing.highestBidderId && (
                      <button onClick={() => handleSellListing(listing.id)} className="text-blue-600 hover:text-blue-900 mr-4">{t('marketplace.sell', 'Sell')}</button>
                    )}
                    <button onClick={() => handleRemoveListing(listing.id)} className="text-red-600 hover:text-red-900">{t('marketplace.remove', 'Remove')}</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (status === 'loading' || loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#f9fcf8]">
            <div className="text-2xl font-semibold text-[#111b0e]">Loading...</div>
        </div>
    );
  }

  return (
    <>
      <div className="relative flex size-full min-h-screen flex-col bg-[#f9fcf8] group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <Sidebar />
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between items-center gap-3 p-4">
                <h1 className="text-[#111b0e] tracking-light text-[32px] font-bold leading-tight min-w-72">
                  {t('marketplace.title', 'Marketplace')}
                </h1>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-[#3db714] text-white rounded-lg hover:bg-[#2f8f0f] transition-colors"
                  >
                    {t('marketplace.addListing', 'Add Listing')}
                  </button>
                  <LanguageSwitch />
                </div>
              </div>

              {error && <div className="p-4 text-red-500 bg-red-100 rounded-md">{error}</div>}
              {successMessage && <div className="p-4 text-green-500 bg-green-100 rounded-md">{successMessage}</div>}

              <div className="p-4">
                <div className="flex border-b mb-4">
                  <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'myListings' ? 'border-b-2 border-[#3db714] text-[#3db714]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('myListings')}
                  >
                    {t('marketplace.myListings', 'My Listings')} ({activeListings.length})
                  </button>
                  <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'completedSales' ? 'border-b-2 border-[#3db714] text-[#3db714]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('completedSales')}
                  >
                    {t('marketplace.completedSales', 'Completed Sales')} ({completedListings.length})
                  </button>
                </div>
                <div>
                  {activeTab === 'myListings' ? renderTable(activeListings) : renderTable(completedListings)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddCropModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onListingAdded={handleListingAdded}
      />
    </>
  );
} 