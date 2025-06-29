import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-lg text-sm font-medium ${
          language === 'en'
            ? 'bg-[#3db714] text-white'
            : 'bg-[#eaf3e7] text-[#111b0e] hover:bg-[#d5e7d0]'
        } transition-colors`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('bn')}
        className={`px-3 py-1 rounded-lg text-sm font-medium ${
          language === 'bn'
            ? 'bg-[#3db714] text-white'
            : 'bg-[#eaf3e7] text-[#111b0e] hover:bg-[#d5e7d0]'
        } transition-colors`}
      >
        বাংলা
      </button>
    </div>
  );
} 