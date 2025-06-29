"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useLanguage } from "@/contexts/LanguageContext";
import { Listing } from "@/generated/prisma";

interface EnrichedListing extends Listing {
  farmer: {
    name: string | null;
    image?: string | null;
  };
}

export default function DealerMarketplacePage() {
  const { language, translations } = useLanguage();
  const router = useRouter();
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string, fallback: string) => translations[key]?.[language] || fallback;

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/listings");
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      const data: EnrichedListing[] = await response.json();
      setListings(data.filter((l) => l.status === "ACTIVE"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            <div className="flex flex-wrap justify-between items-center gap-3 p-4">
              <h1 className="text-[#111b0e] tracking-light text-[32px] font-bold leading-tight min-w-72">
                {t("dealerMarketplace.title", "Marketplace")}
              </h1>
              <LanguageSwitch />
            </div>
            {error && <div className="p-4 text-red-500 bg-red-100 rounded-md">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {listings.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm">
                  {t("dealerMarketplace.noListings", "No active auctions available.")}
                </div>
              ) : (
                listings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#111b0e] mb-2">{listing.cropName}</h3>
                        <div className="mb-1 text-gray-600 text-sm">
                          {t("dealerMarketplace.quantity", "Quantity")}: {listing.quantity} {listing.unit}
                        </div>
                        <div className="mb-1 text-gray-600 text-sm">
                          {t("dealerMarketplace.price", "Current Bid")}: <span className="text-[#3db714] font-bold">{listing.currentBid || listing.startingPrice} BDT/{listing.unit}</span>
                        </div>
                        <div className="mb-1 text-gray-600 text-sm">
                          {t("dealerMarketplace.farmer", "Farmer")}: {listing.farmer?.name}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          console.log('Navigating to listing id:', listing.id);
                          if (listing.id) {
                            router.push(`/farmer/marketplace/${listing.id}`);
                          } else {
                            alert('Invalid listing id!');
                          }
                        }}
                        className="mt-4 px-4 py-2 bg-[#3db714] text-white rounded-lg hover:bg-[#2f8f0f] transition-colors font-semibold"
                      >
                        {t("dealerMarketplace.viewBid", "View & Bid")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 