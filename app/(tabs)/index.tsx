import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View, Animated, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { detectObjects } from "../../lib/visionApi";

export default function ObjectDetectScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (!autoDetecting) return;
    const interval = setInterval(async () => {
      await captureAndAnalyze();
    }, 30000); 

    return () => clearInterval(interval);
  }, [autoDetecting, captureAndAnalyze]);

  const captureAndAnalyze = React.useCallback(async () => {
    if (!cameraRef.current || loading) return;
    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.3 });
      const detections = await detectObjects(photo.base64);
      const formatted = detections.map(
        (item) => `${item.label} (${item.confidence.toFixed(1)}%)`
      );
      setResults(formatted);
      
      // Trigger animation when results appear
      if (formatted.length > 0) {
        fadeAnim.setValue(0);
        slideAnim.setValue(100);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error("Detection error:", error);
      Alert.alert("Error", "Detection failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [loading, fadeAnim, slideAnim]);

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#9E9E9E" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>We need camera access to detect objects.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.grantButton}>
          <Text style={styles.grantButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        ref={cameraRef}
        onCameraReady={() => setAutoDetecting(true)}
      />
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        ) : results.length > 0 ? (
          <View style={styles.resultsContainer}>
            <View style={styles.headerRow}>
              <MaterialCommunityIcons name="eye-check" size={24} color="#4285F4" />
              <Text style={styles.headerText}>Detected Objects</Text>
            </View>
            {results.map((r, i) => {
              const [label, confidence] = r.split(' (');
              const confidenceValue = parseFloat(confidence?.replace('%)', '') || '0');
              
              return (
                <Animated.View 
                  key={i} 
                  style={[
                    styles.resultCard,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.resultIcon}>
                    <MaterialCommunityIcons 
                      name={getIconForLabel(label)} 
                      size={24} 
                      color="#4285F4" 
                    />
                  </View>
                  <View style={styles.resultContent}>
                    <Text style={styles.resultLabel}>{label}</Text>
                    <View style={styles.confidenceContainer}>
                      <View style={[styles.confidenceBar, { width: `${confidenceValue}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.confidenceText}>
                    {confidence?.replace(')', '')}
                  </Text>
                </Animated.View>
              );
            })}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons name="magnify-scan" size={48} color="#9E9E9E" />
            <Text style={styles.placeholder}>Scanning for objects...</Text>
            <Text style={styles.placeholderSubtext}>Point your camera at objects to detect them</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// Helper function to get icons for different object types
function getIconForLabel(label: string): any {
  const lowercaseLabel = label.toLowerCase();
  
  if (lowercaseLabel.includes('person') || lowercaseLabel.includes('people')) return 'account';
  if (lowercaseLabel.includes('phone') || lowercaseLabel.includes('mobile')) return 'cellphone';
  if (lowercaseLabel.includes('hand')) return 'hand-back-right';
  if (lowercaseLabel.includes('car') || lowercaseLabel.includes('vehicle')) return 'car';
  if (lowercaseLabel.includes('dog') || lowercaseLabel.includes('cat') || lowercaseLabel.includes('animal')) return 'paw';
  if (lowercaseLabel.includes('plant') || lowercaseLabel.includes('flower')) return 'flower';
  if (lowercaseLabel.includes('book')) return 'book-open-variant';
  if (lowercaseLabel.includes('computer') || lowercaseLabel.includes('laptop')) return 'laptop';
  if (lowercaseLabel.includes('food') || lowercaseLabel.includes('fruit')) return 'food-apple';
  if (lowercaseLabel.includes('furniture') || lowercaseLabel.includes('chair') || lowercaseLabel.includes('table')) return 'sofa';
  if (lowercaseLabel.includes('indoor') || lowercaseLabel.includes('outdoor')) return 'home';
  
  return 'tag';
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    // Material Design elevation
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#5F6368",
    fontSize: 16,
    fontWeight: "500",
  },
  resultsContainer: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#202124",
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
  },
  resultContent: {
    flex: 1,
    gap: 6,
  },
  resultLabel: {
    color: "#202124",
    fontSize: 16,
    fontWeight: "600",
  },
  confidenceContainer: {
    height: 4,
    backgroundColor: "#E8EAED",
    borderRadius: 2,
    overflow: "hidden",
  },
  confidenceBar: {
    height: "100%",
    backgroundColor: "#4285F4",
    borderRadius: 2,
  },
  confidenceText: {
    color: "#5F6368",
    fontSize: 14,
    fontWeight: "600",
  },
  placeholderContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  placeholder: {
    color: "#5F6368",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  placeholderSubtext: {
    color: "#9AA0A6",
    fontSize: 14,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#202124",
    marginTop: 16,
  },
  permissionText: {
    fontSize: 16,
    color: "#5F6368",
    textAlign: "center",
    marginBottom: 8,
  },
  grantButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 8,
    shadowColor: "#4285F4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  grantButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
