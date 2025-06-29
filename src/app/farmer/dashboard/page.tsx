'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import CropCard from '@/components/dashboard/CropCard';
import Alert from '@/components/dashboard/Alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { Listing, User } from '@/generated/prisma';
import Link from 'next/link';

type EnrichedListing = Listing & {
  farmer: Pick<User, 'name'>;
};

const alerts = [
  {
    title: 'Weather Update',
    message: 'High temperatures expected tomorrow',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
        <path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z" />
      </svg>
    ),
  },
];

export default function FarmerDashboard() {
  const { language, translations } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string, fallback: string) => translations[key]?.[language] || fallback;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchMyListings();
      fetchMyCrops();
    }
  }, [status, router]);

  const fetchMyListings = async () => {
    try {
      const response = await fetch('/api/listings');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const allListings: EnrichedListing[] = await response.json();
      // Filter listings by the logged-in farmer
      const userListings = allListings.filter(
        (listing: EnrichedListing) => listing.farmerId === session?.user?.id
      );
      setListings(userListings);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchMyCrops = async () => {
    try {
      const response = await fetch('/api/crops');
      if (!response.ok) {
        throw new Error('Failed to fetch crops');
      }
      const cropsData = await response.json();
      setCrops(cropsData);
    } catch (err: any) {
      console.error('Failed to fetch crops:', err);
    } finally {
      setLoading(false);
    }
  };

  // Convert crops to crop cards format
  const cropCards = crops.map((crop) => ({
    name: crop.name,
    acres: crop.area,
    imageUrl: crop.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkCnYHkQT3p_AlUCQ6WRp9e4u9UTEthR160hzKbxMV4xdzlkzvCW6FeuDzveXTr2t10RdlGlbP3Y1aiTlD6cQaXVMVt-YPXI4e-hIqAraUNqQ5l-57hJJcg5eSjFX9C6zddDJ--z_ECLhY2yGAG8QaCDItie7aNQGZp3TJsCzeGG3FfVwgqy310rkyWg2hW4GhiQAdLg_lVAZqSYZbSMKJK1xz_1AHQrNbGVNeZHDgK6i36UhI85NcLeJKuyul3cR-lAB-QL1Q3auz',
  }));

  // Convert listings to auctions format
  const auctions = listings.map((listing) => ({
    id: listing.id,
    crop: listing.cropName,
    quantity: `${listing.quantity} ${listing.unit}`,
    currentBid: `${listing.currentBid || listing.startingPrice} BDT/${listing.unit}`,
    status: listing.status,
  }));

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9fcf8]">
        <div className="text-2xl font-semibold text-[#111b0e]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fcf8] group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111b0e] tracking-light text-[32px] font-bold leading-tight min-w-72">{t('dashboard.title', 'Dashboard')}</p>
            </div>
            
            {error && <div className="p-4 text-red-500 bg-red-100 rounded-md">{error}</div>}
            
            <h2 className="text-[#111b0e] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{t('dashboard.myCrops', 'My Crops')}</h2>
            <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-stretch p-4 gap-3">
                {crops.length > 0 ? (
                  crops.map((crop) => (
                    <CropCard
                      key={crop.id}
                      id={crop.id}
                      name={crop.name}
                      acres={crop.area}
                      imageUrl={crop.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkCnYHkQT3p_AlUCQ6WRp9e4u9UTEthR160hzKbxMV4xdzlkzvCW6FeuDzveXTr2t10RdlGlbP3Y1aiTlD6cQaXVMVt-YPXI4e-hIqAraUNqQ5l-57hJJcg5eSjFX9C6zddDJ--z_ECLhY2yGAG8QaCDItie7aNQGZp3TJsCzeGG3FfVwgqy310rkyWg2hW4GhiQAdLg_lVAZqSYZbSMKJK1xz_1AHQrNbGVNeZHDgK6i36UhI85NcLeJKuyul3cR-lAB-QL1Q3auz'}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 px-4 text-gray-500">
                    {t('dashboard.noCrops', 'No crops managed yet. Add your first crop in the Crops section!')}
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-[#111b0e] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{t('dashboard.auctions', 'Auctions')}</h2>
            <div className="px-4 py-3 @container">
              <div className="flex overflow-hidden rounded-lg border border-[#d5e7d0] bg-[#f9fcf8]">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-[#f9fcf8]">
                      <th className="px-4 py-3 text-left text-[#111b0e] w-[400px] text-sm font-medium leading-normal">{t('dashboard.crop', 'Crop')}</th>
                      <th className="px-4 py-3 text-left text-[#111b0e] w-[400px] text-sm font-medium leading-normal">{t('dashboard.quantity', 'Quantity')}</th>
                      <th className="px-4 py-3 text-left text-[#111b0e] w-[400px] text-sm font-medium leading-normal">{t('dashboard.currentBid', 'Current Bid')}</th>
                      <th className="px-4 py-3 text-left text-[#111b0e] w-60 text-sm font-medium leading-normal">{t('dashboard.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auctions.length > 0 ? (
                      auctions.map((auction, index) => (
                        <tr key={index} className="border-t border-t-[#d5e7d0]">
                          <td className="h-[72px] px-4 py-2 w-[400px] text-[#111b0e] text-sm font-normal leading-normal">
                            <Link href={`/farmer/marketplace/${auction.id}`} className="hover:underline text-[#111b0e]">
                              {auction.crop}
                            </Link>
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[400px] text-[#5f974e] text-sm font-normal leading-normal">{auction.quantity}</td>
                          <td className="h-[72px] px-4 py-2 w-[400px] text-[#5f974e] text-sm font-normal leading-normal">{auction.currentBid}</td>
                          <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                            <button className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 text-[#111b0e] text-sm font-medium leading-normal w-full ${
                              auction.status === 'ACTIVE' ? 'bg-[#eaf3e7]' : 'bg-gray-200'
                            }`}>
                              <span className="truncate">{auction.status}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="h-[72px] px-4 py-2 text-center text-gray-500">
                          {t('dashboard.noAuctions', 'No auctions found.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="text-[#111b0e] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{t('dashboard.alerts', 'Alerts')}</h2>
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                {...alert}
                onClick={() => router.push('/farmer/weather')}
                clickable={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 