'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: {
    [key: string]: any;
  };
}

const translations = {
  'logout': {
    en: 'Logout',
    bn: 'লগআউট'
  },
  'identify.disease': {
    en: 'Identify Disease',
    bn: 'রোগ সনাক্ত করুন'
  },
  'describe.symptoms': {
    en: 'Describe Symptoms',
    bn: 'লক্ষণগুলি বর্ণনা করুন'
  },
  'upload.image': {
    en: 'Upload Image',
    bn: 'ছবি আপলোড করুন'
  },
  'analyzing': {
    en: 'Analyzing...',
    bn: 'বিশ্লেষণ করা হচ্ছে...'
  },
  'upload.instruction': {
    en: 'Click to upload or drag and drop',
    bn: 'আপলোড করতে ক্লিক করুন বা ড্র্যাগ করে ছাড়ুন'
  },
  'file.types': {
    en: 'PNG, JPG or JPEG (MAX. 800x400px)',
    bn: 'PNG, JPG বা JPEG (সর্বোচ্চ 800x400px)'
  },
  'symptoms.placeholder': {
    en: "Describe the symptoms you're observing in your crops",
    bn: 'আপনার ফসলে যে লক্ষণগুলি দেখছেন তা বর্ণনা করুন'
  },
  'disease.identification': {
    en: 'Crop Disease Identification',
    bn: 'ফসলের রোগ সনাক্তকরণ'
  },
  'upload.description': {
    en: "Upload an image of your crop or describe the symptoms you're observing to identify potential diseases and receive treatment recommendations.",
    bn: 'সম্ভাব্য রোগ সনাক্ত করতে এবং চিকিৎসার পরামর্শ পেতে আপনার ফসলের একটি ছবি আপলোড করুন বা লক্ষণগুলি বর্ণনা করুন।'
  },
  'identified.symptoms': {
    en: 'Identified Symptoms',
    bn: 'সনাক্ত লক্ষণসমূহ'
  },
  'risk.assessment': {
    en: 'Risk Assessment',
    bn: 'ঝুঁকি মূল্যায়ন'
  },
  'severity': {
    en: 'Severity',
    bn: 'তীব্রতা'
  },
  'spread.risk': {
    en: 'Spread Risk',
    bn: 'বিস্তারের ঝুঁকি'
  },
  'treatment.plan': {
    en: 'Treatment Plan',
    bn: 'চিকিৎসা পরিকল্পনা'
  },
  'immediate.actions': {
    en: 'Immediate Actions',
    bn: 'তাৎক্ষণিক পদক্ষেপ'
  },
  'long.term': {
    en: 'Long-term Management',
    bn: 'দীর্ঘমেয়াদী ব্যবস্থাপনা'
  },
  'preventive.measures': {
    en: 'Preventive Measures',
    bn: 'প্রতিরোধমূলক ব্যবস্থা'
  },
  'confidence': {
    en: 'Confidence',
    bn: 'আস্থা'
  },
  'crops.title': {
    en: 'My Crops',
    bn: 'আমার ফসল'
  },
  'add.crop': {
    en: 'Add New Crop',
    bn: 'নতুন ফসল যোগ করুন'
  },
  'crop.details': {
    en: 'Crop Details',
    bn: 'ফসলের বিবরণ'
  },
  'area': {
    en: 'Area',
    bn: 'এলাকা'
  },
  'acres': {
    en: 'acres',
    bn: 'একর'
  },
  'planting.date': {
    en: 'Planting Date',
    bn: 'রোপণের তারিখ'
  },
  'harvest.date': {
    en: 'Expected Harvest',
    bn: 'প্রত্যাশিত ফসল'
  },
  'status': {
    en: 'Status',
    bn: 'অবস্থা'
  },
  'health': {
    en: 'Health',
    bn: 'স্বাস্থ্য'
  },
  'growing': {
    en: 'Growing',
    bn: 'বৃদ্ধি'
  },
  'ready': {
    en: 'Ready to Harvest',
    bn: 'ফসল কাটার জন্য প্রস্তুত'
  },
  'harvested': {
    en: 'Harvested',
    bn: 'কাটা হয়েছে'
  },
  'healthy': {
    en: 'Healthy',
    bn: 'স্বাস্থ্যকর'
  },
  'attention': {
    en: 'Needs Attention',
    bn: 'নজর দেওয়া প্রয়োজন'
  },
  'critical': {
    en: 'Critical',
    bn: 'সংকটপূর্ণ'
  },
  'planning.title': {
    en: 'Crop Planning Tool',
    bn: 'ফসল পরিকল্পনা টুল'
  },
  'field.details': {
    en: 'Field Details',
    bn: 'জমির বিবরণ'
  },
  'field.size': {
    en: 'Field Size (acres)',
    bn: 'জমির আয়তন (একর)'
  },
  'soil.type': {
    en: 'Soil Type',
    bn: 'মাটির ধরন'
  },
  'climate.zone': {
    en: 'Climate Zone',
    bn: 'জলবায়ু অঞ্চল'
  },
  'water.availability': {
    en: 'Water Availability',
    bn: 'পানির প্রাপ্যতা'
  },
  'get.recommendations': {
    en: 'Get Recommendations',
    bn: 'সুপারিশ পান'
  },
  'getting.recommendations': {
    en: 'Getting Recommendations...',
    bn: 'সুপারিশ পাওয়া হচ্ছে...'
  },
  'recommendations': {
    en: 'Recommendations',
    bn: 'সুপারিশসমূহ'
  },
  'suggested.crops': {
    en: 'Suggested Crops',
    bn: 'প্রস্তাবিত ফসল'
  },
  'expected.yield': {
    en: 'Expected Yield',
    bn: 'প্রত্যাশিত ফলন'
  },
  'requirements': {
    en: 'Requirements',
    bn: 'প্রয়োজনীয়তা'
  },
  'schedule': {
    en: 'Schedule',
    bn: 'সময়সূচী'
  },
  'planting': {
    en: 'Planting',
    bn: 'রোপণ'
  },
  'harvest': {
    en: 'Harvest',
    bn: 'ফসল কাটা'
  },
  'rotation.plan': {
    en: 'Crop Rotation Plan',
    bn: 'ফসল আবর্তন পরিকল্পনা'
  },
  'resource.requirements': {
    en: 'Resource Requirements',
    bn: 'সম্পদের প্রয়োজনীয়তা'
  },
  'water.requirement': {
    en: 'Water Requirement',
    bn: 'পানির প্রয়োজনীয়তা'
  },
  'fertilizer.requirement': {
    en: 'Fertilizer Requirement',
    bn: 'সারের প্রয়োজনীয়তা'
  },
  'labor.requirement': {
    en: 'Labor Requirement',
    bn: 'শ্রমিকের প্রয়োজনীয়তা'
  },
  'select.soil.type': {
    en: 'Select soil type',
    bn: 'মাটির ধরন নির্বাচন করুন'
  },
  'select.climate.zone': {
    en: 'Select climate zone',
    bn: 'জলবায়ু অঞ্চল নির্বাচন করুন'
  },
  'select.water.availability': {
    en: 'Select water availability',
    bn: 'পানির প্রাপ্যতা নির্বাচন করুন'
  },
  'enter.field.size': {
    en: 'Enter field size',
    bn: 'জমির আয়তন লিখুন'
  },
  'weather.title': {
    en: 'Weather Information',
    bn: 'আবহাওয়ার তথ্য'
  },
  'weather.placeholder': {
    en: 'Enter a location (e.g., city name)',
    bn: 'একটি অবস্থান লিখুন (যেমন, শহরের নাম)'
  },
  'weather.fetchButton': {
    en: 'Get Weather',
    bn: 'আবহাওয়া দেখুন'
  },
  'weather.loading': {
    en: 'Loading...',
    bn: 'লোড হচ্ছে...'
  },
  'weather.locationError': {
    en: 'Please enter a location.',
    bn: 'অনুগ্রহ করে একটি অবস্থান লিখুন।'
  },
  'weather.locationNotFound': {
    en: 'Location not found. Please try another.',
    bn: 'অবস্থান পাওয়া যায়নি। অনুগ্রহ করে অন্য একটি চেষ্টা করুন।'
  },
  'weather.fetchError': {
    en: 'Failed to fetch weather data. Please try again.',
    bn: 'আবহাওয়ার তথ্য আনতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।'
  },
  'weather.temperature': {
    en: 'Temperature',
    bn: 'তাপমাত্রা'
  },
  'weather.windspeed': {
    en: 'Wind Speed',
    bn: 'বায়ুর গতি'
  },
  'forecast.title': {
    en: '7-Day Forecast',
    bn: '৭ দিনের পূর্বাভাস'
  },
  'forecast.max': {
    en: 'Max',
    bn: 'সর্বোচ্চ'
  },
  'forecast.min': {
    en: 'Min',
    bn: 'সর্বনিম্ন'
  },
  'forecast.precip': {
    en: 'Precipitation',
    bn: 'বৃষ্টিপাত'
  },
  'dashboard.title': {
    en: 'Dashboard',
    bn: 'ড্যাশবোর্ড'
  },
  'dashboard.myCrops': {
    en: 'My Crops',
    bn: 'আমার ফসল'
  },
  'dashboard.planted': {
    en: 'Planted',
    bn: 'রোপণকৃত'
  },
  'dashboard.acres': {
    en: 'acres',
    bn: 'একর'
  },
  'dashboard.auctions': {
    en: 'Auctions',
    bn: 'নিলাম'
  },
  'dashboard.crop': {
    en: 'Crop',
    bn: 'ফসল'
  },
  'dashboard.quantity': {
    en: 'Quantity',
    bn: 'পরিমাণ'
  },
  'dashboard.currentBid': {
    en: 'Current Bid',
    bn: 'বর্তমান বিড'
  },
  'dashboard.status': {
    en: 'Status',
    bn: 'অবস্থা'
  },
  'dashboard.noCrops': {
    en: 'No crops managed yet. Add your first crop in the Crops section!',
    bn: 'এখনও কোনো ফসল ব্যবস্থাপনা করা হয়নি। ফসল বিভাগে আপনার প্রথম ফসল যোগ করুন!'
  },
  'dashboard.noAuctions': {
    en: 'No auctions found.',
    bn: 'কোনো নিলাম পাওয়া যায়নি।'
  },
  'dashboard.alerts': {
    en: 'Alerts',
    bn: 'সতর্কতা'
  },
  'marketplace.title': {
    en: 'Marketplace',
    bn: 'বাজার'
  },
  'marketplace.myListings': {
    en: 'My Listings',
    bn: 'আমার তালিকা'
  },
  'marketplace.completedSales': {
    en: 'Completed Sales',
    bn: 'সম্পন্ন বিক্রয়'
  },
  'marketplace.addListing': {
    en: 'Add Listing',
    bn: 'তালিকা যোগ করুন'
  },
  'marketplace.crop': {
    en: 'Crop',
    bn: 'ফসল'
  },
  'marketplace.quantity': {
    en: 'Quantity',
    bn: 'পরিমাণ'
  },
  'marketplace.price': {
    en: 'Price',
    bn: 'মূল্য'
  },
  'marketplace.currentPrice': {
    en: 'Current Price',
    bn: 'বর্তমান মূল্য'
  },
  'marketplace.salePrice': {
    en: 'Sale Price',
    bn: 'বিক্রয় মূল্য'
  },
  'marketplace.status': {
    en: 'Status',
    bn: 'অবস্থা'
  },
  'marketplace.actions': {
    en: 'Actions',
    bn: 'কর্ম'
  },
  'marketplace.viewDetails': {
    en: 'View Details',
    bn: 'বিস্তারিত দেখুন'
  },
  'marketplace.sell': {
    en: 'Sell',
    bn: 'বিক্রি করুন'
  },
  'marketplace.remove': {
    en: 'Remove',
    bn: 'সরান'
  },
  'marketplace.confirmRemove': {
    en: 'Are you sure you want to remove this listing?',
    bn: 'আপনি কি নিশ্চিতভাবে এই তালিকাটি সরাতে চান?'
  },
  'marketplace.confirmSell': {
    en: 'Are you sure you want to sell this crop to the highest bidder?',
    bn: 'আপনি কি নিশ্চিতভাবে এই ফসলটি সর্বোচ্চ দরদাতার কাছে বিক্রি করতে চান?'
  },
  'marketplace.sellSuccess': {
    en: 'Crop sold successfully!',
    bn: 'ফসল সফলভাবে বিক্রি হয়েছে!'
  },
  'marketplace.noListings': {
    en: 'No active listings.',
    bn: 'কোনো সক্রিয় তালিকা নেই।'
  },
  'marketplace.noCompletedSales': {
    en: 'No completed sales.',
    bn: 'কোনো সম্পন্ন বিক্রয় নেই।'
  },
  'ACTIVE': {
    en: 'Active',
    bn: 'সক্রিয়'
  },
  'SOLD': {
    en: 'Sold',
    bn: 'বিক্রি হয়েছে'
  },
  'EXPIRED': {
    en: 'Expired',
    bn: 'মেয়াদোত্তীর্ণ'
  },
  'REMOVED': {
    en: 'Removed',
    bn: 'সরানো হয়েছে'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 