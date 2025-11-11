/**
 * Vision API Integration
 * 
 * This file provides options for real object detection:
 * 1. Hugging Face (free tier available, no key needed for demo)
 * 2. Google Cloud Vision (requires API key)
 * 3. Demo mode (for offline testing)
 */
const api_ = process.env.API_KEY; // Add your Google Vision API key in .env file
export interface DetectionResult {
  label: string;
  confidence: number;
}

// Configuration
const USE_DEMO_MODE = false; // Set to false to use real API
const GOOGLE_VISION_API_KEY = api_; // Add your key here






/**
 * Analyze image using Google Cloud Vision
 */
async function analyzeWithGoogleVision(base64: string): Promise<DetectionResult[]> {
  if (!GOOGLE_VISION_API_KEY) {
    throw new Error("Google Vision API key not configured");
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const labels = data.responses?.[0]?.labelAnnotations || [];
    
    return labels.map((item: any) => ({
      label: item.description,
      confidence: item.score * 100,
    }));
  } catch (error) {
    console.error("Google Vision API error:", error);
    throw error;
  }
}

/**
 * Demo mode for offline testing
 */
function getDemoResults(): DetectionResult[] {
  return [
    { label: "Person", confidence: 85.3 },
    // { label: "Mobile Phone", confidence: 72.1 },
    // { label: "Hand", confidence: 68.4 },
    // { label: "Indoor Environment", confidence: 55.2 },
    // { label: "Furniture", confidence: 48.9 },
  ];
}

/**
 * Main detection function
 * Tries real APIs first, falls back to demo mode
 */
export async function detectObjects(base64: string): Promise<DetectionResult[]> {
  if (USE_DEMO_MODE) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getDemoResults();
  }

  // Try Hugging Face first (free, no key needed)

    // Fallback to Google Vision if configured
    if (GOOGLE_VISION_API_KEY) {
      try {
        return await analyzeWithGoogleVision(base64);
      } catch (error2) {
        console.error("Google Vision also failed:", error2);
        // Final fallback to demo
        return getDemoResults();
      }
    }
    
    // Final fallback to demo
    return getDemoResults();
  }


