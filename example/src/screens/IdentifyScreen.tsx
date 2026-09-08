import { useCallback, useEffect, useRef, useState } from 'react';
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  cropFace,
  type FaceBox,
} from 'face-recognition-sdk';
import { IdentifySession } from 'face-recognition-sdk/identify';
import { mapLandmarksToCrop } from 'face-recognition-sdk/capture';
import {
  loadPeople,
  loadSettings,
  type AppSettings,
} from '../FaceDatabase';
import FaceOverlay from '../components/FaceOverlay';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Identify'>;

export default function IdentifyScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const device = useCameraDevice(settings?.camera_lens ?? 'front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const sessionRef = useRef<IdentifySession | null>(null);
  const recognizedRef = useRef(false);
  const confirmingRef = useRef(false);
  const boxesRef = useRef<FaceBox[]>([]);
  const settingsRef = useRef<AppSettings | null>(null);
  const [boxes, setBoxes] = useState<FaceBox[]>([]);
  const [frameSize, setFrameSize] = useState({ w: 480, h: 640 });
  const [mirrorOverlay, setMirrorOverlay] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      settingsRef.current = s;
    });
  }, []);

  const tryConfirm = useCallback(
    async (personIndex: number, score: number) => {
      const s = settingsRef.current;
      const session = sessionRef.current;
      if (!s || !session || recognizedRef.current) return;
      if (confirmingRef.current) return;
      confirmingRef.current = true;
      session.leave();
      const uri = session.lastUri;
      if (!uri) {
        confirmingRef.current = false;
        return;
      }
      try {
        const list = await loadPeople();
        const person = list[personIndex] ?? list[personIndex - 1];
        if (!person) {
          confirmingRef.current = false;
          return;
        }
        const faceBox = boxesRef.current[0] ?? null;
        if (!faceBox) {
          confirmingRef.current = false;
          return;
        }
        recognizedRef.current = true;
        let identifiedUri = uri;
        let cropLandmarks: { x: number; y: number }[] = [];
        try {
          const cropB64 = await cropFace(uri, faceBox);
          identifiedUri = `data:image/jpeg;base64,${cropB64}`;
          const srcW =
            session.frameSize.w > 0
              ? session.frameSize.w
              : Math.max(faceBox.x2 + 1, 1);
          const srcH =
            session.frameSize.h > 0
              ? session.frameSize.h
              : Math.max(faceBox.y2 + 1, 1);
          cropLandmarks = mapLandmarksToCrop(faceBox, srcW, srcH, 200, 200);
        } catch {
          // keep full frame
        }
        navigation.replace('Result', {
          identifiedUri,
          enrolledThumbB64: person.thumbB64,
          personName: person.name,
          similarity: score,
          box: faceBox,
          cropLandmarks,
        });
      } catch {
        confirmingRef.current = false;
        recognizedRef.current = false;
      }
    },
    [navigation]
  );

  useEffect(() => {
    if (!settings || !hasPermission || !device) return;
    let cancelled = false;
    let session: IdentifySession | null = null;

    (async () => {
      const features = (await loadPeople()).map((p) => p.featureB64);
      if (cancelled) return;
      session = new IdentifySession({
        settings: {
          frontCamera: settings.camera_lens === 'front',
          matchThreshold: settings.identify_threshold,
          livenessLevel: settings.liveness_level,
        },
        featureTemplates: features,
        onTracking: (next, frame) => {
          if (recognizedRef.current || cancelled) return;
          boxesRef.current = next;
          setBoxes(next);
          setFrameSize(frame);
        },
        onMatch: (personIndex, score) => {
          void tryConfirm(personIndex, score);
        },
      });
      sessionRef.current = session;
      setMirrorOverlay(session.overlayMirror);
      const cam = cameraRef.current;
      if (cam) session.attach(cam);
      await session.start();
    })();

    return () => {
      cancelled = true;
      void session?.dispose();
      sessionRef.current = null;
    };
  }, [settings, hasPermission, device, tryConfirm]);

  useEffect(() => {
    const cam = cameraRef.current;
    const session = sessionRef.current;
    if (cam && session) session.attach(cam);
  });

  if (!settings || !hasPermission || !device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!recognizedRef.current}
        photo
        video
        audio={false}
        isMirrored={false}
        resizeMode="cover"
      />
      <FaceOverlay
        width={width}
        height={height}
        frameW={frameSize.w}
        frameH={frameSize.h}
        mirror={mirrorOverlay}
        boxes={boxes}
        settings={settings}
      />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blackBg,
  },
  back: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.text, fontSize: 22 },
});
