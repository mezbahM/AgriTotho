import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const getSystemPrompt = (language: 'en' | 'bn') => {
  if (language === 'bn') {
    return `আপনি একজন বিশেষজ্ঞ কৃষি রোগ সনাক্তকরণ সিস্টেম। প্রদত্ত ছবি এবং লক্ষণগুলি বিশ্লেষণ করে ফসলের রোগ সনাক্ত করুন।

অনুগ্রহ করে নিম্নলিখিত JSON কাঠামোতে উত্তর দিন:

{
  "disease": {
    "name": "রোগের নাম",
    "confidence": "High/Medium/Low",
    "description": "রোগের সংক্ষিপ্ত বিবরণ",
    "symptoms": ["লক্ষণ ১", "লক্ষণ ২", "..."],
    "treatment": ["চিকিৎসা ১", "চিকিৎসা ২", "..."],
    "preventiveMeasures": ["প্রতিরোধমূলক ব্যবস্থা ১", "প্রতিরোধমূলক ব্যবস্থা ২", "..."]
  },
  "analysis": {
    "matchedSymptoms": ["মিলে যাওয়া লক্ষণ ১", "মিলে যাওয়া লক্ষণ ২", "..."],
    "severity": "High/Medium/Low",
    "spreadRisk": "High/Medium/Low"
  },
  "recommendations": {
    "immediate": ["তাৎক্ষণিক পদক্ষেপ ১", "তাৎক্ষণিক পদক্ষেপ ২", "..."],
    "longTerm": ["দীর্ঘমেয়াদী কৌশল ১", "দীর্ঘমেয়াদী কৌশল ২", "..."]
  }
}

নিয়মাবলী:
১. শুধুমাত্র JSON অবজেক্ট দিয়ে উত্তর দিন, অতিরিক্ত টেক্সট নয়
২. সব অ্যারেতে কমপক্ষে ২টি আইটেম থাকতে হবে
৩. confidence, severity, এবং spreadRisk ফিল্ডে শুধু High/Medium/Low ব্যবহার করুন
৪. বিবরণগুলি সংক্ষিপ্ত কিন্তু তথ্যপূর্ণ রাখুন
৫. যদি রোগ নিশ্চিতভাবে সনাক্ত করতে না পারেন, confidence "Low" সেট করুন
৬. যদি ছবি বিশ্লেষণ করতে না পারেন, একটি ত্রুটি অবজেক্ট রিটার্ন করুন`;
  }

  return `You are an expert agricultural disease detection system. Your task is to analyze the provided image and symptoms to identify crop diseases.

IMPORTANT: You must respond with valid JSON only, following exactly this structure:

{
  "disease": {
    "name": "Disease name",
    "confidence": "High/Medium/Low",
    "description": "Brief description of the disease",
    "symptoms": ["symptom1", "symptom2", "..."],
    "treatment": ["treatment1", "treatment2", "..."],
    "preventiveMeasures": ["measure1", "measure2", "..."]
  },
  "analysis": {
    "matchedSymptoms": ["matched1", "matched2", "..."],
    "severity": "High/Medium/Low",
    "spreadRisk": "High/Medium/Low"
  },
  "recommendations": {
    "immediate": ["action1", "action2", "..."],
    "longTerm": ["strategy1", "strategy2", "..."]
  }
}

Rules:
1. Respond ONLY with the JSON object, no additional text
2. Ensure all arrays have at least 2 items
3. Use only High/Medium/Low for confidence, severity, and spreadRisk fields
4. Keep descriptions concise but informative
5. If you cannot identify the disease with certainty, set confidence to "Low"
6. If you cannot analyze the image, return an error object`;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
          continue;
        }
      }
      throw error;
    }
  }
  
  throw lastError;
}

export async function analyzeCropDisease(image: File, symptoms: string, language: 'en' | 'bn' = 'en') {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

    // Convert image to base64
    const imageData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(image);
    });

    // Prepare the prompt with image and symptoms
    const prompt = `${getSystemPrompt(language)}

Analyze this case:
- Image: [Crop image provided]
- Reported Symptoms: ${symptoms}

${language === 'bn' ? 'মনে রাখবেন: শুধুমাত্র JSON অবজেক্ট দিয়ে উত্তর দিন, অতিরিক্ত টেক্সট বা ব্যাখ্যা নয়।' : 'Remember: Respond ONLY with the JSON object, no additional text or explanations.'}`;

    // Create image part for the model
    const imagePart = {
      inlineData: {
        data: imageData.split(',')[1],
        mimeType: image.type
      }
    };

    // Generate content with retry logic
    const result = await retryWithBackoff(() => model.generateContent([prompt, imagePart]));
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    try {
      // Remove any potential non-JSON text before or after the JSON object
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate the response structure
      if (!parsed.disease || !parsed.analysis || !parsed.recommendations) {
        throw new Error('Invalid response structure');
      }

      return parsed;
    } catch (error: any) {
      console.error('Parse error:', error);
      // Return a more informative error
      return {
        error: language === 'bn' ? "প্রতিক্রিয়া পার্স করতে ব্যর্থ" : "Failed to parse response",
        details: error.message || (language === 'bn' ? 'অজানা পার্সিং ত্রুটি' : 'Unknown parsing error'),
        rawResponse: text
      };
    }
  } catch (error: any) {
    console.error('Error analyzing crop disease:', error);
    return {
      error: language === 'bn' ? "বিশ্লেষণ ব্যর্থ হয়েছে" : "Analysis failed",
      details: error.message || (language === 'bn' ? 'অজানা ত্রুটি' : 'Unknown error'),
      rawResponse: null
    };
  }
}

const getCropPlanningPrompt = (language: 'en' | 'bn') => {
  if (language === 'bn') {
    return `আপনি একজন কৃষি পরিকল্পনা বিশেষজ্ঞ। আপনার কাজ হল প্রদত্ত ক্ষেত্রের বিবরণ বিশ্লেষণ করে ফসল পরিকল্পনার জন্য সুপারিশ প্রদান করা।

শুধুমাত্র নিম্নলিখিত JSON কাঠামোতে উত্তর দিন:

{
  "cropSuggestions": [
    {
      "name": "ফসলের নাম",
      "confidence": "High/Medium/Low",
      "description": "ফসলের সংক্ষিপ্ত বিবরণ",
      "expectedYield": "প্রত্যাশিত ফলন",
      "requirements": {
        "soil": "মাটির প্রয়োজনীয়তা",
        "water": "পানির প্রয়োজনীয়তা",
        "climate": "জলবায়ুর প্রয়োজনীয়তা"
      },
      "schedule": {
        "plantingTime": "রোপণের সময়",
        "harvestTime": "ফসল কাটার সময়"
      }
    }
  ],
  "rotationPlan": ["মৌসুম ১: ফসল", "মৌসুম ২: ফসল"],
  "resourceRequirements": {
    "water": "পানির প্রয়োজনীয়তা",
    "fertilizer": "সারের প্রয়োজনীয়তা",
    "labor": "শ্রমিকের প্রয়োজনীয়তা"
  }
}`;
  }

  return `You are an agricultural planning expert. Your task is to analyze the given field details and provide recommendations for crop planning.

IMPORTANT: You must respond with valid JSON only, following exactly this structure:

{
  "cropSuggestions": [
    {
      "name": "Crop name",
      "confidence": "High/Medium/Low",
      "description": "Brief description of why this crop is suitable",
      "expectedYield": "Expected yield per acre/hectare",
      "requirements": {
        "soil": "Soil requirements",
        "water": "Water requirements",
        "climate": "Climate requirements"
      },
      "schedule": {
        "plantingTime": "When to plant",
        "harvestTime": "When to harvest"
      }
    }
  ],
  "rotationPlan": ["Season 1: Crop", "Season 2: Crop"],
  "resourceRequirements": {
    "water": "Water requirements per season",
    "fertilizer": "Fertilizer requirements",
    "labor": "Labor requirements"
  }
}

Rules:
1. Respond ONLY with the JSON object, no additional text
2. Suggest at least 2 suitable crops based on the conditions
3. Use only High/Medium/Low for confidence
4. Keep descriptions concise but informative
5. Consider local climate and seasonal patterns
6. Include sustainable farming practices in recommendations`;
};

export async function getCropPlanningRecommendations(
  fieldSize: number,
  soilType: string,
  climateZone: string,
  waterAvailability: string,
  language: 'en' | 'bn' = 'en'
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

    const prompt = `${getCropPlanningPrompt(language)}

Analyze these field conditions:
- Field Size: ${fieldSize} acres
- Soil Type: ${soilType}
- Climate Zone: ${climateZone}
- Water Availability: ${waterAvailability}

${language === 'bn' ? 'মনে রাখবেন: শুধুমাত্র JSON অবজেক্ট দিয়ে উত্তর দিন, অতিরিক্ত টেক্সট নয়।' : 'Remember: Respond ONLY with the JSON object, no additional text.'}`;

    // Generate content with retry logic
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    const text = response.text();

    try {
      // Remove any potential non-JSON text before or after the JSON object
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate the response structure
      if (!parsed.cropSuggestions || !parsed.rotationPlan || !parsed.resourceRequirements) {
        throw new Error('Invalid response structure');
      }

      return parsed;
    } catch (error: any) {
      console.error('Parse error:', error);
      return {
        error: language === 'bn' ? "প্রতিক্রিয়া পার্স করতে ব্যর্থ" : "Failed to parse response",
        details: error.message || (language === 'bn' ? 'অজানা পার্সিং ত্রুটি' : 'Unknown parsing error'),
        rawResponse: text
      };
    }
  } catch (error: any) {
    console.error('Error getting crop planning recommendations:', error);
    return {
      error: language === 'bn' ? "বিশ্লেষণ ব্যর্থ হয়েছে" : "Analysis failed",
      details: error.message || (language === 'bn' ? 'অজানা ত্রুটি' : 'Unknown error'),
      rawResponse: null
    };
  }
} 