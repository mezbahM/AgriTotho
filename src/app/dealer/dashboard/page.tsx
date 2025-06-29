'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import LanguageSwitch from '@/components/LanguageSwitch';
import { useLanguage } from '@/contexts/LanguageContext';
import { Listing, User } from '@/generated/prisma';

type EnrichedListing = Listing & {
    farmer: Pick<User, 'name'>;
};

// Add type for buying history
interface BuyingHistoryItem extends Listing {
  farmer: {
    name: string | null;
    image: string | null;
  };
}

export default function DealerDashboard() {
    const { language, translations } = useLanguage();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [listings, setListings] = useState<EnrichedListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Add state for buying history
    const [buyingHistory, setBuyingHistory] = useState<BuyingHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);

    const t = (key: string, fallback: string) => translations[key]?.[language] || fallback;

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchActiveListings();
            fetchBuyingHistory();
        }
    }, [status, router]);

    const fetchActiveListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/listings');
            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }
            const data: EnrichedListing[] = await response.json();
            setListings(data.filter(l => l.status === 'ACTIVE'));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch dealer's buying history
    const fetchBuyingHistory = async () => {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const response = await fetch('/api/listings?history=dealer');
            if (!response.ok) {
                throw new Error('Failed to fetch buying history');
            }
            const data: BuyingHistoryItem[] = await response.json();
            setBuyingHistory(data);
        } catch (err: any) {
            setHistoryError(err.message);
        } finally {
            setHistoryLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f9fcf8]">
                <div className="text-2xl font-semibold text-[#111b0e]">Loading...</div>
            </div>
        );
    }

    // Calculate summary
    const activeBids = listings.length;
    const totalPurchases = buyingHistory.length;

    return (
        <div className="relative flex size-full min-h-screen flex-col bg-[#f9fcf8] group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <div className="gap-1 px-6 flex flex-1 justify-center py-5">
                    <Sidebar />
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        <div className="flex flex-wrap justify-between items-center gap-3 p-4">
                            <h1 className="text-[#111b0e] tracking-light text-[32px] font-bold leading-tight min-w-72">
                                {t('dealerDashboard.title', 'Dealer Dashboard')}
                            </h1>
                            <LanguageSwitch />
                        </div>

                        {/* Marketplace Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
                                <span className="text-3xl font-bold text-[#3db714]">{activeBids}</span>
                                <span className="text-gray-600 mt-2">{t('dealerDashboard.activeBids', 'Active Auctions')}</span>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
                                <span className="text-3xl font-bold text-[#3db714]">{totalPurchases}</span>
                                <span className="text-gray-600 mt-2">{t('dealerDashboard.myBids', 'My Bids')}</span>
                            </div>
                        </div>

                        {error && <div className="p-4 text-red-500 bg-red-100 rounded-md">{error}</div>}

                        {/* Active Auctions Table */}
                        <div className="overflow-x-auto mb-10">
                            <h2 className="text-xl font-semibold mb-2 text-[#111b0e]">{t('dealerDashboard.activeAuctions', 'Active Auctions')}</h2>
                            <table className="min-w-full bg-white rounded-lg shadow-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.crop', 'Crop')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.quantity', 'Quantity')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.currentBid', 'Current Bid')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.farmer', 'Farmer')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.actions', 'Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listings.map((listing) => (
                                        <tr key={listing.id}>
                                            <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">{listing.cropName}</td>
                                            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{`${listing.quantity} ${listing.unit}`}</td>
                                            <td className="p-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{`${listing.currentBid || listing.startingPrice} BDT/${listing.unit}`}</td>
                                            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{listing.farmer.name}</td>
                                            <td className="p-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => router.push(`/farmer/marketplace/${listing.id}`)}
                                                    className="text-[#3db714] hover:text-[#2f8f0f] font-bold underline cursor-pointer"
                                                >
                                                    {t('dealerDashboard.view', 'View & Bid')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {listings.length === 0 && !loading && (
                                 <div className="text-center py-10 px-4 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-500">{t('dealerDashboard.noListings', 'There are no active auctions at the moment.')}</p>
                                </div>
                            )}
                        </div>

                        {/* Buying History Table */}
                        <div className="overflow-x-auto">
                            <h2 className="text-xl font-semibold mb-2 text-[#111b0e]">{t('dealerDashboard.myBids', 'My Bids')}</h2>
                            {historyError && <div className="p-4 text-red-500 bg-red-100 rounded-md">{historyError}</div>}
                            <table className="min-w-full bg-white rounded-lg shadow-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.crop', 'Crop')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.quantity', 'Quantity')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.finalPrice', 'Final Price')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.farmer', 'Farmer')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.status', 'Status')}</th>
                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dealerDashboard.ended', 'Ended At')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyLoading ? (
                                        <tr><td colSpan={6} className="text-center p-4">{t('dealerDashboard.loadingHistory', 'Loading...')}</td></tr>
                                    ) : buyingHistory.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center p-4">{t('dealerDashboard.noHistory', 'No purchases yet.')}</td></tr>
                                    ) : (
                                        buyingHistory.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-4 whitespace-nowrap text-sm font-medium text-[#3db714] underline cursor-pointer" onClick={() => router.push(`/farmer/marketplace/${item.id}`)}>
                                                    {item.cropName}
                                                </td>
                                                <td className="p-4 whitespace-nowrap text-sm text-gray-500">{`${item.quantity} ${item.unit}`}</td>
                                                <td className="p-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{`${item.finalPrice || item.currentBid || item.startingPrice} BDT/${item.unit}`}</td>
                                                <td className="p-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                                                    {item.farmer.image && <img src={item.farmer.image} alt={item.farmer.name || ''} className="w-6 h-6 rounded-full" />}
                                                    {item.farmer.name}
                                                </td>
                                                <td className="p-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                                        item.status === 'SOLD' ? 'bg-blue-100 text-blue-800' : 
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 whitespace-nowrap text-sm text-gray-500">{item.endTime ? new Date(item.endTime).toLocaleString() : 'N/A'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 