import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  cropFace,
  templateExtraction,
} from 'face-recognition-sdk';
import {
  FaceCapture,
  toCaptureSettings,
  type CaptureResult,
  type CaptureSettings,
} from 'face-recognition-sdk/capture';
import {
  addPerson,
  autoPersonName,
  loadSettings,
} from '../FaceDatabase';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Capture'>;

function toast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('', msg);
}

export default function CaptureScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<CaptureSettings | null>(null);
  const [lastResult, setLastResult] = useState<CaptureResult | null>(null);

  useEffect(() => {
    loadSettings().then((s) => setSettings(toCaptureSettings(s)));
  }, []);

  const onEnroll = useCallback(async () => {
    const result = lastResult;
    if (!result?.uri || !result.faceBox) {
      toast('Enrollment failed');
      return;
    }
    try {
      const feature = await templateExtraction(result.uri, result.faceBox);
      let thumb: string | null = result.cropB64 ?? null;
      if (!thumb) {
        try {
          thumb = await cropFace(result.uri, result.faceBox);
        } catch {
          thumb = null;
        }
      }
      await addPerson(autoPersonName(), feature, thumb);
      toast('Person enrolled!');
      navigation.goBack();
    } catch (e: any) {
      toast(e?.message ?? 'Enrollment failed');
    }
  }, [lastResult, navigation]);

  if (!settings) {
    return <View style={styles.loading} />;
  }

  return (
    <FaceCapture
      settings={settings}
      onCancel={() => navigation.goBack()}
      onCaptured={setLastResult}
      renderActions={() => (
        <TouchableOpacity style={styles.enrollBtn} onPress={onEnroll}>
          <ImageBackground
            source={require('../assets/tiles/gradient_back.png')}
            style={styles.enrollBg}
            imageStyle={{ borderRadius: 24 }}
          >
            <Text style={styles.enrollText}>Enroll</Text>
          </ImageBackground>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.blackBg },
  enrollBtn: {
    alignSelf: 'center',
    marginTop: 32,
    width: 150,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  enrollBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollText: { color: colors.onPrimary, fontSize: 20, fontWeight: '600' },
});
