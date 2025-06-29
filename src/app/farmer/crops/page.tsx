'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitch from '@/components/LanguageSwitch';
import Link from 'next/link';

interface Crop {
  id: string;
  name: string;
  area: number;
  plantingDate: string;
  expectedHarvestDate: string;
  status: 'growing' | 'ready-to-harvest' | 'harvested';
  healthStatus: 'healthy' | 'needs-attention' | 'critical';
  imageUrl: string;
}

export default function CropsPage() {
  const { language, translations } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    area: string;
    plantingDate: string;
    expectedHarvestDate: string;
    status: string;
    healthStatus: string;
    imageUrl: string;
    imageFile: File | null;
  }>({
    name: '',
    description: '',
    area: '',
    plantingDate: '',
    expectedHarvestDate: '',
    status: 'growing',
    healthStatus: 'healthy',
    imageUrl: '',
    imageFile: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formattedDates, setFormattedDates] = useState<{ [id: string]: { planting: string; harvest: string } }>({});

  const t = (key: string, fallback?: string) =>
    translations?.[key]?.[language] || fallback || key;

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    const newFormatted: { [id: string]: { planting: string; harvest: string } } = {};
    crops.forEach((crop: any) => {
      newFormatted[crop.id] = {
        planting: new Date(crop.plantingDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        harvest: new Date(crop.expectedHarvestDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };
    });
    setFormattedDates(newFormatted);
  }, [crops, language]);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crops');
      const data = await res.json();
      setCrops(data);
    } catch (e) {
      setError('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('area', form.area);
      formData.append('plantingDate', form.plantingDate);
      formData.append('expectedHarvestDate', form.expectedHarvestDate);
      formData.append('status', form.status);
      formData.append('healthStatus', form.healthStatus);
      if (form.imageFile) formData.append('image', form.imageFile);
      const res = await fetch('/api/crops', { method: 'POST', body: formData });
      if (!res.ok) {
        let errorMsg = 'Unknown error';
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          // If not JSON, keep default error
        }
        setError(errorMsg);
        return;
      }
      const crop = await res.json();
      setIsModalOpen(false);
      setForm({
        name: '', description: '', area: '', plantingDate: '', expectedHarvestDate: '', status: 'growing', healthStatus: 'healthy', imageUrl: '', imageFile: null,
      });
      fetchCrops();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: Crop['status']) => {
    switch (status) {
      case 'growing':
        return 'bg-blue-100 text-blue-800';
      case 'ready-to-harvest':
        return 'bg-green-100 text-green-800';
      case 'harvested':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusColor = (status: Crop['healthStatus']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fcf8] group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between items-center gap-3 p-4">
              <h1 className="text-[#111b0e] tracking-light text-[32px] font-bold leading-tight min-w-72">
                {t('crops.title', 'Crops')}
              </h1>
              <div className="flex items-center gap-4">
                <LanguageSwitch />
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[#3db714] text-white rounded-lg hover:bg-[#2f8f0f] transition-colors"
                  onClick={() => setIsModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('add.crop', 'Add Crop')}
                </button>
              </div>
            </div>
            {error && <div className="p-2 bg-red-100 text-red-700 rounded mb-2">{error}</div>}
            {success && <div className="p-2 bg-green-100 text-green-700 rounded mb-2">{success}</div>}
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {crops.map((crop) => (
                  <Link key={crop.id} href={`/farmer/crops/${crop.id}`} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative">
                      <img
                        src={crop.imageUrl || '/public/file.svg'}
                        alt={crop.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-[#111b0e] mb-2">{crop.name}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[#5f974e]">{t('area', 'Area')}:</span>
                          <span className="text-[#111b0e]">{crop.area} {t('acres', 'acres')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5f974e]">{t('planting.date', 'Planting Date')}:</span>
                          <span className="text-[#111b0e]">{formattedDates[crop.id]?.planting}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5f974e]">{t('harvest.date', 'Harvest Date')}:</span>
                          <span className="text-[#111b0e]">{formattedDates[crop.id]?.harvest}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#5f974e]">{t('status', 'Status')}:</span>
                          <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(crop.status as Crop['status'])}`}>
                            {t(crop.status === 'ready-to-harvest' ? 'ready' : crop.status, crop.status)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#5f974e]">{t('health', 'Health')}:</span>
                          <span className={`px-2 py-1 rounded-full text-sm ${getHealthStatusColor(crop.healthStatus as Crop['healthStatus'])}`}>
                            {t(crop.healthStatus === 'needs-attention' ? 'attention' : crop.healthStatus, crop.healthStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {/* Add Crop Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <form onSubmit={handleAddCrop} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold mb-2 text-[#111b0e]">{t('add.crop', 'Add Crop')}</h2>
                  <input className="w-full border p-2 rounded text-[#111b0e] placeholder:text-[#111b0e]" placeholder={t('crop.name', 'Crop Name')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  <textarea className="w-full border p-2 rounded text-[#111b0e] placeholder:text-[#111b0e]" placeholder="Brief Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                  <input className="w-full border p-2 rounded text-[#111b0e] placeholder:text-[#111b0e]" placeholder={t('area', 'Area')} type="number" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} required />
                  <label className="block text-[#111b0e] font-medium mb-1" htmlFor="plantingDate">{t('planting.date', 'Planting Date')}</label>
                  <input id="plantingDate" className="w-full border p-2 rounded text-[#111b0e] placeholder:text-[#111b0e]" placeholder={t('planting.date', 'Planting Date')} type="date" value={form.plantingDate} onChange={e => setForm(f => ({ ...f, plantingDate: e.target.value }))} required />
                  <label className="block text-[#111b0e] font-medium mb-1" htmlFor="expectedHarvestDate">{t('harvest.date', 'Expected Harvest Date')}</label>
                  <input id="expectedHarvestDate" className="w-full border p-2 rounded text-[#111b0e] placeholder:text-[#111b0e]" placeholder={t('harvest.date', 'Expected Harvest Date')} type="date" value={form.expectedHarvestDate} onChange={e => setForm(f => ({ ...f, expectedHarvestDate: e.target.value }))} required />
                  <label className="block text-[#111b0e] font-medium mb-1" htmlFor="status">Status</label>
                  <select id="status" className="w-full border p-2 rounded text-[#111b0e]" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} required>
                    <option value="growing">Growing</option>
                    <option value="ready-to-harvest">Ready to Harvest</option>
                    <option value="harvested">Harvested</option>
                  </select>
                  <label className="block text-[#111b0e] font-medium mb-1" htmlFor="healthStatus">Health Status</label>
                  <select id="healthStatus" className="w-full border p-2 rounded text-[#111b0e]" value={form.healthStatus} onChange={e => setForm(f => ({ ...f, healthStatus: e.target.value }))} required>
                    <option value="healthy">Healthy</option>
                    <option value="needs-attention">Needs Attention</option>
                    <option value="critical">Critical</option>
                  </select>
                  <input type="file" accept="image/*" className="w-full border p-2 rounded text-[#111b0e] border-[#111b0e] file:text-[#111b0e] file:bg-white file:border-0 file:mr-2" onChange={e => setForm(f => ({ ...f, imageFile: e.target.files && e.target.files[0] ? e.target.files[0] : null }))} />
                  <div className="flex gap-2 justify-end">
                    <button type="button" className="px-4 py-2 rounded bg-gray-200 text-[#111b0e]" onClick={() => setIsModalOpen(false)}>{t('cancel', 'Cancel')}</button>
                    <button type="submit" className="px-4 py-2 rounded bg-[#3db714] text-white">{t('add', 'Add')}</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 