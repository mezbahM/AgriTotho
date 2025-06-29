"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

type DiseaseEntry = { disease: string; date: string; treatment: string };
type Crop = {
  id: string;
  name: string;
  area: number;
  plantingDate: string;
  expectedHarvestDate: string;
  irrigationIntervalDays: number;
  lastWateredDate: string;
  lastFertilizer: string;
  lastFertilizerDate: string;
  nextFertilizerDate: string;
  nutrientLevel: string;
  diseaseHistory: DiseaseEntry[];
  nextTask: string;
  nextTaskDone: boolean;
  fieldLocation: string;
  status: string;
  healthStatus: string;
  imageUrl?: string;
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const statusBadge = (status: string) => {
  let color = "bg-blue-100 text-blue-800";
  if (status.toLowerCase().includes("harvest")) color = "bg-green-100 text-green-800";
  if (status.toLowerCase().includes("attention")) color = "bg-yellow-100 text-yellow-800";
  if (status.toLowerCase().includes("disease")) color = "bg-red-100 text-red-800";
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>;
};

const healthBadge = (health: string) => {
  let color = "bg-green-100 text-green-800";
  if (health.toLowerCase().includes("attention")) color = "bg-yellow-100 text-yellow-800";
  if (health.toLowerCase().includes("disease")) color = "bg-red-100 text-red-800";
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{health}</span>;
};

const fallbackImage = "/globe.svg";

export default function CropDetailsPage() {
  const params = useParams() || {};
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [formatted, setFormatted] = useState<{
    planting?: string;
    expectedHarvest?: string;
    lastWatered?: string;
    lastFertilizerDate?: string;
    nextFertilizerDate?: string;
    diseaseHistory?: { disease: string; date: string; treatment: string }[];
  }>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/crops?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        let cropData: Crop | null = null;
        if (Array.isArray(data)) {
          cropData = data.find((c: Crop) => c.id === id) || null;
        } else if (data && data.id === id) {
          cropData = data;
        } else if (data && data.length === 1) {
          cropData = data[0];
        }
        setCrop(cropData);
        if (cropData && cropData.expectedHarvestDate) {
          const left = Math.max(
            0,
            Math.ceil(
              (new Date(cropData.expectedHarvestDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );
          setDaysLeft(left);
        }
        if (cropData) {
          setFormatted({
            planting: cropData.plantingDate ? new Date(cropData.plantingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
            expectedHarvest: cropData.expectedHarvestDate ? new Date(cropData.expectedHarvestDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
            lastWatered: cropData.lastWateredDate ? new Date(cropData.lastWateredDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
            lastFertilizerDate: cropData.lastFertilizerDate ? new Date(cropData.lastFertilizerDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
            nextFertilizerDate: cropData.nextFertilizerDate ? new Date(cropData.nextFertilizerDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
            diseaseHistory: Array.isArray(cropData.diseaseHistory)
              ? cropData.diseaseHistory.map((d) => ({
                  ...d,
                  date: d.date ? new Date(d.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
                }))
              : [],
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load crop details");
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <svg className="animate-spin h-8 w-8 text-[#5f974e] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
      <span className="text-[#5f974e]">Loading crop details...</span>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <span className="text-red-600 mb-2">{error}</span>
      <button onClick={() => router.refresh()} className="px-4 py-2 bg-[#5f974e] text-white rounded">Retry</button>
    </div>
  );
  if (!crop) return <div className="p-8">Crop not found.</div>;

  const totalDays = crop.plantingDate && crop.expectedHarvestDate ? Math.max(1, Math.ceil((new Date(crop.expectedHarvestDate).getTime() - new Date(crop.plantingDate).getTime()) / (1000 * 60 * 60 * 24))) : 1;
  const progress = daysLeft !== null ? Math.max(0, Math.min(100, Math.round(((totalDays - daysLeft) / totalDays) * 100))) : 0;

  return (
    <div className="max-w-xl w-full mx-auto bg-white rounded-lg shadow p-4 sm:p-6 mt-8">
      <button onClick={() => router.back()} className="mb-4 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-[#111b0e]">← Back to My Crops</button>
      <div className="w-full aspect-video relative rounded-lg overflow-hidden mb-4 border border-gray-100 shadow-sm">
        <Image src={crop.imageUrl || fallbackImage} alt={crop.name} fill style={{objectFit:'cover'}} />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-[#111b0e]">{crop.name}</h2>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Planted: {formatted.planting}</span>
          <span>Harvest: {formatted.expectedHarvest}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
          <div className="bg-[#5f974e] h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="text-xs text-gray-600 mt-1">Days left to harvest: <span className="font-semibold text-[#5f974e]">{daysLeft !== null ? daysLeft : "-"}</span></div>
      </div>
      <div className="flex flex-col sm:flex-row sm:gap-8 gap-2 mb-4">
        <div><span className="font-semibold text-[#5f974e]">Area:</span> {crop.area} acres</div>
        <div><span className="font-semibold text-[#5f974e]">Field Location:</span> {crop.fieldLocation}</div>
      </div>
      <div className="flex gap-4 mb-4">
        <div><span className="font-semibold text-[#5f974e]">Status:</span> {statusBadge(crop.status)}</div>
        <div><span className="font-semibold text-[#5f974e]">Health:</span> {healthBadge(crop.healthStatus)}</div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-[#111b0e] mb-1">Irrigation</h3>
        <div className="text-sm text-gray-700">Schedule: Every {crop.irrigationIntervalDays} days</div>
        <div className="text-sm text-gray-700">Last watered: {formatted.lastWatered}</div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-[#111b0e] mb-1">Fertilizer</h3>
        <div className="text-sm text-gray-700">Last applied: {crop.lastFertilizer} ({formatted.lastFertilizerDate})</div>
        <div className="text-sm text-gray-700">Next due: {formatted.nextFertilizerDate}</div>
        <div className="text-sm text-gray-700">Nutrient level: {crop.nutrientLevel}</div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-[#111b0e] mb-1">Disease History</h3>
        {Array.isArray(formatted.diseaseHistory) && formatted.diseaseHistory.length > 0 ? (
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {formatted.diseaseHistory.map((d, i) => (
              <li key={i}>
                {d.disease} ({d.date}) - {d.treatment}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-gray-500">None</span>
        )}
      </div>
      <div className="mb-2">
        <h3 className="font-semibold text-[#111b0e] mb-1">Next Task</h3>
        <div className="text-sm text-gray-700 flex items-center">
          {crop.nextTask} {crop.nextTaskDone ? <span className="ml-2 text-green-600">✔️</span> : null}
        </div>
      </div>
    </div>
  );
} 