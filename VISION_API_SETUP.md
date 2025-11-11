# Vision API Setup Guide

This app currently runs in **demo mode** for object detection. To enable real AI-powered detection, follow the instructions below.

## Option 1: Hugging Face (Recommended - Free)

1. No setup required! The app automatically uses Hugging Face's free Vision Transformer model
2. To activate: Set `USE_DEMO_MODE = false` in `lib/visionApi.ts`
3. Visit [Hugging Face](https://huggingface.co/google/vit-base-patch16-224) for model details

**Pros:**
- Free to use
- No API key needed
- Works out of the box
- Good for demos and testing

**Cons:**
- May have rate limits
- Requires internet connection
- Slower than on-device solutions

---

## Option 2: Google Cloud Vision

For production apps requiring enterprise-grade vision AI:

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Vision API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated key

4. **Secure Your Key**
   - Click on the created key
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Vision API"
   - Save changes

5. **Add Key to App**
   - Open `lib/visionApi.ts`
   - Replace `const GOOGLE_VISION_API_KEY = "";` with your key
   - Set `USE_DEMO_MODE = false`

**Pricing:** $1.50 per 1,000 requests (first 1,000/month free)

---

## Option 3: TensorFlow Lite (On-Device)

For offline, private, fast detection without internet:

### Installation
```bash
npm install @tensorflow/tfjs-react-native @tensorflow/tfjs-platform-react-native
npm install expo-gl expo-gl-cpp
```

### Setup
1. Add to `app/_layout.tsx`:
```typescript
import '@tensorflow/tfjs-react-native';
```

2. Load COCO-SSD model:
```typescript
import * as cocoSsd from '@tensorflow-models/coco-ssd';
const model = await cocoSsd.load();
```

3. Initialize TensorFlow:
```typescript
await tf.ready();
const loadedModel = await cocoSsd.load();
```

**Pros:**
- Works offline
- Fast processing
- Privacy-focused (no data sent to servers)
- No API costs

**Cons:**
- Large app size (~30MB model)
- Requires TensorFlow Lite setup
- More complex implementation

---

## Option 4: ML Kit (Firebase)

For easy integration with Firebase:

1. **Install Firebase**
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/ml
   ```

2. **Setup Firebase**
   - Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Place files in appropriate directories

3. **Use ML Kit**
   ```typescript
   import mlkit from '@react-native-firebase/ml';
   const labels = await mlkit().vision().cloudImageLabeler().processImage(imagePath);
   ```

**Pros:**
- Easy to integrate
- Works offline with on-device models
- Enterprise support available

**Cons:**
- Requires Firebase setup
- Some features require Blaze plan
- Larger app size

---

## Current Setup

**Status:** Demo mode (simulated detection)

**Configuration File:** `lib/visionApi.ts`

**Quick Switch:**
```typescript
const USE_DEMO_MODE = true;  // Set to false to use real APIs
```

---

## Next Steps

1. **For Testing:** Keep demo mode
2. **For Production:** Choose an option above
3. **For Privacy:** Use TensorFlow Lite (Option 3)
4. **For Speed:** Use on-device solutions (Options 3 or 4)

---

## Troubleshooting

**"API key not valid"**
- Check key is copied correctly (no extra spaces)
- Ensure API is enabled in Google Cloud Console
- Verify billing is enabled (if required)

**"Network request failed"**
- Check internet connection
- Verify API endpoint is correct
- Check for rate limits

**"Model failed to load"**
- Clear app cache
- Check device storage (models are large)
- Verify TensorFlow initialization

---

## Support

For issues or questions:
- Check the [Expo Camera docs](https://docs.expo.dev/versions/latest/sdk/camera/)
- Visit [TensorFlow.js React Native](https://www.tensorflow.org/js/guide/platforms/react_native)
- Review [Google Cloud Vision docs](https://cloud.google.com/vision/docs)

