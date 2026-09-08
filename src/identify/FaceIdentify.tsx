import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import type { FaceBox } from '../index';
import { IdentifySession, type IdentifySettings } from './IdentifySession';

export type FaceIdentifyProps = {
  settings: IdentifySettings;
  featureTemplates: string[];
  onMatch: (personIndex: number, score: number) => void;
  onCancel?: () => void;
  title?: string;
};

/** Drop-in live 1:N identify. App supplies templates and handles the match. */
export function FaceIdentify({
  settings,
  featureTemplates,
  onMatch,
  onCancel,
  title = 'Identify',
}: FaceIdentifyProps) {
  const { width, height } = useWindowDimensions();
  const device = useCameraDevice(settings.frontCamera ? 'front' : 'back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [boxes, setBoxes] = useState<FaceBox[]>([]);
  const [mirror, setMirror] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (!hasPermission || !device) return;
    const session = new IdentifySession({
      settings,
      featureTemplates,
      onTracking: (next) => setBoxes(next),
      onMatch,
    });
    setMirror(session.overlayMirror);
    const attach = setInterval(() => {
      const cam = cameraRef.current;
      if (cam) {
        session.attach(cam);
        void session.start();
        clearInterval(attach);
      }
    }, 80);
    return () => {
      clearInterval(attach);
      void session.dispose();
    };
  }, [hasPermission, device, settings, featureTemplates, onMatch]);

  if (!hasPermission || !device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#D0BCFF" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        photo
        video
        audio={false}
        isMirrored={false}
        resizeMode="cover"
      />
      {boxes.map((b, i) => {
        const scale = Math.max(width / 480, height / 640);
        const left = (mirror ? width - b.x2 * scale : b.x1 * scale);
        return (
          <View
            key={i}
            pointerEvents="none"
            style={[
              styles.box,
              {
                left,
                top: b.y1 * scale,
                width: (b.x2 - b.x1) * scale,
                height: (b.y2 - b.y1) * scale,
              },
            ]}
          />
        );
      })}
      {onCancel ? (
        <TouchableOpacity style={styles.back} onPress={onCancel}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00E5FF',
  },
  back: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F378B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 22 },
  title: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 20,
  },
});
