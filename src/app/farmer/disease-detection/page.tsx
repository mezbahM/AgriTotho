'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { analyzeCropDisease } from '@/utils/gemini';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitch from '@/components/LanguageSwitch';

interface DiseaseAnalysis {
  disease: {
    name: string;
    confidence: string;
    description: string;
    symptoms: string[];
    treatment: string[];
    preventiveMeasures: string[];
  };
  analysis: {
    matchedSymptoms: string[];
    severity: string;
    spreadRisk: string;
  };
  recommendations: {
    immediate: string[];
    longTerm: string[];
  };
  error?: string;
}

const diseases = [
  {
    name: 'Late Blight',
    symptoms: 'Dark lesions on leaves and stems, white mold growth.',
    treatment: 'Apply fungicides, improve air circulation.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkCnYHkQT3p_AlUCQ6WRp9e4u9UTEthR160hzKbxMV4xdzlkzvCW6FeuDzveXTr2t10RdlGlbP3Y1aiTlD6cQaXVMVt-YPXI4e-hIqAraUNqQ5l-57hJJcg5eSjFX9C6zddDJ--z_ECLhY2yGAG8QaCDItie7aNQGZp3TJsCzeGG3FfVwgqy310rkyWg2hW4GhiQAdLg_lVAZqSYZbSMKJK1xz_1AHQrNbGVNeZHDgK6i36UhI85NcLeJKuyul3cR-lAB-QL1Q3auz'
  },
  {
    name: 'Powdery Mildew',
    symptoms: 'White powdery spots on leaves and stems.',
    treatment: 'Apply fungicides, ensure proper spacing between plants.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhFPJw6Eo7iiESSASIFp-dGsQNjK0W5ae3XtGib3KvxmvMC9Y_YRB4G06q1v9Q3uuisxu0cj2z919gS1apY0vCZEVusJPKapVGLDl1CWTQAgbbP3aUQ-x495jBJlDLWOFB_jBff0BJ6HkxHbaw6LNYvzgKhEJh8OOQmpfZx9yB_O_aV1pR98_2IKEquOGBn2MOBtIPOcAZ4Hf_uCo1VWVLm2bJ4Z9xHS1sm7hY3sFqWgSNqHaKUNhxf4wEwLBLkXjpINljHsJvP5oL'
  }
];

export default function DiseaseDetection() {
  const { language, translations } = useLanguage();
  const [symptoms, setSymptoms] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string) => translations[key][language];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      setError(language === 'bn' ? 'বিশ্লেষণের জন্য একটি ছবি আপলোড করুন' : 'Please upload an image to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeCropDisease(selectedImage, symptoms, language);
      if (result.error) {
        setError(result.error);
      } else {
        setAnalysis(result);
      }
    } catch (err) {
      setError(language === 'bn' ? 'রোগ বিশ্লেষণ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to analyze the disease. Please try again.');
      console.error(err);
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
                {t('disease.identification')}
              </h1>
              <LanguageSwitch />
            </div>

            <div className="p-4">
              <p className="text-[#5f974e] mb-6">
                {t('upload.description')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#111b0e] text-base font-medium mb-2">
                    {t('describe.symptoms')}
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder={t('symptoms.placeholder')}
                    className="w-full min-h-[120px] p-3 rounded-lg border border-[#d5e7d0] bg-white text-[#111b0e] placeholder:text-[#111b0e] focus:outline-none focus:ring-2 focus:ring-[#3db714] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-[#111b0e] text-base font-medium mb-2">
                    {t('upload.image')}
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-[#d5e7d0] border-dashed rounded-lg cursor-pointer bg-white hover:bg-[#eaf3e7] transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="max-h-52 object-contain" />
                        ) : (
                          <>
                            <svg className="w-8 h-8 mb-4 text-[#5f974e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mb-2 text-sm text-[#5f974e]">{t('upload.instruction')}</p>
                            <p className="text-xs text-[#5f974e]">{t('file.types')}</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`${
                    loading ? 'bg-[#86c967]' : 'bg-[#3db714] hover:bg-[#2f8f0f]'
                  } text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[150px]`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('analyzing')}
                    </>
                  ) : (
                    t('identify.disease')
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
              </form>

              {analysis && (
                <div className="mt-8 space-y-6">
                  <div className="bg-white rounded-lg border border-[#d5e7d0] overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[#111b0e] text-2xl font-bold">{analysis.disease.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          analysis.disease.confidence === 'High' ? 'bg-green-100 text-green-800' :
                          analysis.disease.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {t('confidence')}: {analysis.disease.confidence}
                        </span>
                      </div>
                      
                      <p className="text-[#5f974e] mb-6">{analysis.disease.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-[#111b0e] font-semibold mb-2">{t('identified.symptoms')}</h3>
                          <ul className="list-disc list-inside space-y-1 text-[#5f974e]">
                            {analysis.disease.symptoms.map((symptom, index) => (
                              <li key={index}>{symptom}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-[#111b0e] font-semibold mb-2">{t('risk.assessment')}</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[#5f974e]">{t('severity')}:</span>
                              <span className={`px-2 py-1 rounded-full text-sm ${
                                analysis.analysis.severity === 'High' ? 'bg-red-100 text-red-800' :
                                analysis.analysis.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {analysis.analysis.severity}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#5f974e]">{t('spread.risk')}:</span>
                              <span className={`px-2 py-1 rounded-full text-sm ${
                                analysis.analysis.spreadRisk === 'High' ? 'bg-red-100 text-red-800' :
                                analysis.analysis.spreadRisk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {analysis.analysis.spreadRisk}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-[#111b0e] font-semibold mb-2">{t('treatment.plan')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-[#111b0e] font-medium mb-2">{t('immediate.actions')}</h4>
                            <ul className="list-disc list-inside space-y-1 text-[#5f974e]">
                              {analysis.recommendations.immediate.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-[#111b0e] font-medium mb-2">{t('long.term')}</h4>
                            <ul className="list-disc list-inside space-y-1 text-[#5f974e]">
                              {analysis.recommendations.longTerm.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-[#111b0e] font-semibold mb-2">{t('preventive.measures')}</h3>
                        <ul className="list-disc list-inside space-y-1 text-[#5f974e]">
                          {analysis.disease.preventiveMeasures.map((measure, index) => (
                            <li key={index}>{measure}</li>
                          ))}
                        </ul>
                      </div>
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