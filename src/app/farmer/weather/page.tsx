'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import LanguageSwitch from '@/components/LanguageSwitch';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WeatherPage() {
  const { language, translations } = useLanguage();
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayFormatted, setTodayFormatted] = useState('');
  const [forecastFormatted, setForecastFormatted] = useState<string[]>([]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setTodayFormatted(new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, [language]);

  useEffect(() => {
    if (weatherData && weatherData.daily && weatherData.daily.time) {
      setForecastFormatted(weatherData.daily.time.map((time: string) => new Date(time).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long' })));
    }
  }, [weatherData, language]);

  const handleFetchWeather = async () => {
    if (!location) {
      setError(t('weather.locationError'));
      return;
    }
    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      // First, get coordinates for the location
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1`);
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(t('weather.locationNotFound'));
      }

      const { latitude, longitude, name } = geoData.results[0];

      // Then, fetch weather data
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`);
      const weather = await weatherResponse.json();
      
      setWeatherData({ ...weather, name });

    } catch (err: any) {
      setError(err.message || t('weather.fetchError'));
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
                {t('weather.title')}
              </h1>
              <LanguageSwitch />
            </div>

            <div className="p-4 space-y-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('weather.placeholder')}
                  className="flex-grow p-2 border rounded-md text-[#111b0e] placeholder:text-[#111b0e]"
                />
                <button
                  onClick={handleFetchWeather}
                  disabled={loading}
                  className="px-4 py-2 bg-[#3db714] text-white rounded-lg hover:bg-[#2f8f0f] transition-colors disabled:bg-gray-400"
                >
                  {loading ? t('weather.loading') : t('weather.fetchButton')}
                </button>
              </div>

              {error && <p className="text-red-500">{error}</p>}

              {weatherData && (
                <div className="space-y-6">
                  {/* Current Weather */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-semibold mb-2 text-black">{weatherData.name}</h2>
                    <p className="text-lg text-gray-700 mb-4">{todayFormatted}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-5xl font-bold text-black">{weatherData.current_weather.temperature}°C</p>
                        <p className="text-gray-600">{t('weather.temperature')}</p>
                      </div>
                      <div>
                        <p className="text-2xl text-black">{weatherData.current_weather.windspeed} km/h</p>
                        <p className="text-gray-600">{t('weather.windspeed')}</p>
                      </div>
                    </div>
                  </div>

                  {/* 7-day Forecast */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-semibold mb-4 text-black">{t('forecast.title')}</h3>
                    <div className="space-y-4">
                      {weatherData.daily.time.map((time: string, index: number) => (
                        <div key={time} className="flex justify-between items-center border-b pb-2">
                          <p className="font-medium text-black">{forecastFormatted[index]}</p>
                          <p className="text-gray-700">{t('forecast.max')}: {weatherData.daily.temperature_2m_max[index]}°C</p>
                          <p className="text-gray-700">{t('forecast.min')}: {weatherData.daily.temperature_2m_min[index]}°C</p>
                          <p className="text-gray-700">{t('forecast.precip')}: {weatherData.daily.precipitation_sum[index]} mm</p>
                        </div>
                      ))}
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