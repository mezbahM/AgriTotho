'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitch from '@/components/LanguageSwitch';
import { getCropPlanningRecommendations } from '@/utils/gemini';

interface PlanningRecommendation {
  cropSuggestions: {
    name: string;
    confidence: string;
    description: string;
    expectedYield: string;
    requirements: {
      soil: string;
      water: string;
      climate: string;
    };
    schedule: {
      plantingTime: string;
      harvestTime: string;
    };
  }[];
  rotationPlan: string[];
  resourceRequirements: {
    water: string;
    fertilizer: string;
    labor: string;
  };
}

export default function CropPlanningPage() {
  const { language, translations } = useLanguage();
  const [fieldSize, setFieldSize] = useState('');
  const [soilType, setSoilType] = useState('');
  const [climateZone, setClimateZone] = useState('');
  const [waterAvailability, setWaterAvailability] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<PlanningRecommendation | null>(null);

  const t = (key: keyof typeof translations) => translations[key][language];

  const soilTypes = [
    { key: 'loamy', en: 'Loamy', bn: 'দোঁআশ' },
    { key: 'sandy', en: 'Sandy', bn: 'বেলে' },
    { key: 'clay', en: 'Clay', bn: 'কাদামাটি' },
    { key: 'silt', en: 'Silt', bn: 'পলি' },
    { key: 'peat', en: 'Peat', bn: 'পিট' },
    { key: 'chalky', en: 'Chalky', bn: 'চকযুক্ত' }
  ];

  const climateZones = [
    { key: 'tropical', en: 'Tropical', bn: 'ক্রান্তীয়' },
    { key: 'subtropical', en: 'Subtropical', bn: 'উপক্রান্তীয়' },
    { key: 'temperate', en: 'Temperate', bn: 'উষ্ণমণ্ডলীয়' },
    { key: 'continental', en: 'Continental', bn: 'মহাদেশীয়' },
    { key: 'mediterranean', en: 'Mediterranean', bn: 'ভূমধ্যসাগরীয়' }
  ];

  const waterSources = [
    { key: 'abundant', en: 'Abundant', bn: 'প্রচুর' },
    { key: 'moderate', en: 'Moderate', bn: 'মধ্যম' },
    { key: 'limited', en: 'Limited', bn: 'সীমিত' },
    { key: 'seasonal', en: 'Seasonal', bn: 'ঋতুভিত্তিক' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCropPlanningRecommendations(
        Number(fieldSize),
        soilType,
        climateZone,
        waterAvailability,
        language
      );

      if ('error' in result) {
        setError(result.error);
        setRecommendations(null);
      } else {
        setRecommendations(result);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError(language === 'bn' 
        ? 'সুপারিশ পেতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' 
        : 'Failed to get recommendations. Please try again.');
      setRecommendations(null);
    } finally {
      setLoading(false);
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
                {t('planning.title')}
              </h1>
              <LanguageSwitch />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
              {/* Input Form */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#111b0e] mb-6">{t('field.details')}</h2>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5f974e] mb-2">
                      {t('field.size')}
                    </label>
                    <input
                      type="number"
                      value={fieldSize}
                      onChange={(e) => setFieldSize(e.target.value)}
                      className="w-full p-2 border border-[#d5e7d0] rounded-lg text-[#111b0e] placeholder:text-[#111b0e] focus:outline-none focus:ring-2 focus:ring-[#3db714]"
                      placeholder={t('enter.field.size')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5f974e] mb-2">
                      {t('soil.type')}
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full p-2 border border-[#d5e7d0] rounded-lg text-[#111b0e] focus:outline-none focus:ring-2 focus:ring-[#3db714]"
                      required
                    >
                      <option value="" className="text-[#111b0e]">{t('select.soil.type')}</option>
                      {soilTypes.map(type => (
                        <option key={type.key} value={type.en} className="text-[#111b0e]">{type[language]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5f974e] mb-2">
                      {t('climate.zone')}
                    </label>
                    <select
                      value={climateZone}
                      onChange={(e) => setClimateZone(e.target.value)}
                      className="w-full p-2 border border-[#d5e7d0] rounded-lg text-[#111b0e] focus:outline-none focus:ring-2 focus:ring-[#3db714]"
                      required
                    >
                      <option value="" className="text-[#111b0e]">{t('select.climate.zone')}</option>
                      {climateZones.map(zone => (
                        <option key={zone.key} value={zone.en} className="text-[#111b0e]">{zone[language]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5f974e] mb-2">
                      {t('water.availability')}
                    </label>
                    <select
                      value={waterAvailability}
                      onChange={(e) => setWaterAvailability(e.target.value)}
                      className="w-full p-2 border border-[#d5e7d0] rounded-lg text-[#111b0e] focus:outline-none focus:ring-2 focus:ring-[#3db714]"
                      required
                    >
                      <option value="" className="text-[#111b0e]">{t('select.water.availability')}</option>
                      {waterSources.map(source => (
                        <option key={source.key} value={source.en} className="text-[#111b0e]">{source[language]}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3db714] text-white rounded-lg hover:bg-[#2f8f0f] transition-colors disabled:bg-[#9ca3af]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Getting Recommendations...
                      </>
                    ) : (
                      t('get.recommendations')
                    )}
                  </button>
                </form>
              </div>

              {/* Recommendations Display */}
              {recommendations && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-[#111b0e] mb-6">Recommendations</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-[#111b0e] mb-3">Suggested Crops</h3>
                      <div className="space-y-4">
                        {recommendations.cropSuggestions.map((crop, index) => (
                          <div key={index} className="border border-[#d5e7d0] rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-[#111b0e] font-medium">{crop.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-sm ${
                                crop.confidence === 'High' ? 'bg-green-100 text-green-800' :
                                crop.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {crop.confidence} Confidence
                              </span>
                            </div>
                            <p className="text-sm text-[#5f974e] mb-2">{crop.description}</p>
                            <p className="text-sm text-[#111b0e]">Expected Yield: {crop.expectedYield}</p>
                            
                            <div className="mt-3 space-y-2">
                              <h5 className="text-sm font-medium text-[#111b0e]">Requirements:</h5>
                              <ul className="text-sm text-[#5f974e] list-disc list-inside">
                                <li>Soil: {crop.requirements.soil}</li>
                                <li>Water: {crop.requirements.water}</li>
                                <li>Climate: {crop.requirements.climate}</li>
                              </ul>
                            </div>

                            <div className="mt-3 space-y-2">
                              <h5 className="text-sm font-medium text-[#111b0e]">Schedule:</h5>
                              <ul className="text-sm text-[#5f974e] list-disc list-inside">
                                <li>Planting: {crop.schedule.plantingTime}</li>
                                <li>Harvest: {crop.schedule.harvestTime}</li>
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-[#111b0e] mb-3">Crop Rotation Plan</h3>
                      <ul className="list-disc list-inside text-[#5f974e]">
                        {recommendations.rotationPlan.map((plan, index) => (
                          <li key={index}>{plan}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-[#111b0e] mb-3">Resource Requirements</h3>
                      <ul className="list-disc list-inside text-[#5f974e]">
                        <li>Water Requirement: {recommendations.resourceRequirements.water}</li>
                        <li>Fertilizer Requirement: {recommendations.resourceRequirements.fertilizer}</li>
                        <li>Labor Requirement: {recommendations.resourceRequirements.labor}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 