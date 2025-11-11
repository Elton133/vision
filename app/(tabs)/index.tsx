import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { detectObjects } from "../../lib/visionApi";

export default function ObjectDetectScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);

  useEffect(() => {
    if (!autoDetecting) return;
    const interval = setInterval(async () => {
      await captureAndAnalyze();
    }, 30000); 

    return () => clearInterval(interval);
  }, [autoDetecting]);

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || loading) return;
    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.3 });
      const detections = await detectObjects(photo.base64);
      const formatted = detections.map(
        (item) => `${item.label} (${item.confidence.toFixed(1)}%)`
      );
      setResults(formatted);
    } catch (error) {
      console.error("Detection error:", error);
      Alert.alert("Error", "Detection failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.centered}>
        <Text>We need camera access to detect objects.</Text>
        <Text onPress={requestPermission} style={styles.grantBtn}>
          Grant Permission
        </Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        ref={cameraRef}
        onCameraReady={() => setAutoDetecting(true)}
      />
      <View style={styles.overlay}>
        {loading ? (
          <ActivityIndicator size="large" color="#FFD54F" />
        ) : results.length > 0 ? (
          results.map((r, i) => (
            <Text key={i} style={styles.resultText}>
              {r}
            </Text>
          ))
        ) : (
          <Text style={styles.placeholder}>Scanning for objects...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  resultText: {
    color: "#FFD54F",
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 4,
  },
  placeholder: {
    color: "#ccc",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  grantBtn: {
    color: "#007AFF",
    marginTop: 10,
    fontWeight: "bold",
  },
});
