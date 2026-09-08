import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { cropFace } from 'face-recognition-sdk';
import { loadSettings } from '../FaceDatabase';
import { mapLandmarksToCrop } from 'face-recognition-sdk/capture';
import { resultDetailRows } from '../resultDetails';
import LandmarkImage from '../components/LandmarkImage';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AttributeResult'>;

export default function AttributeResultScreen({ route }: Props) {
  const { faceUri, box, cropLandmarks: initialMarks } = route.params;
  const [cropUri, setCropUri] = useState<string | null>(null);
  const [marks, setMarks] = useState(initialMarks ?? []);
  const [rows, setRows] = useState<
    { kind: 'section' | 'field'; title: string; value: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const b64 = await cropFace(faceUri, box);
        const uri = `data:image/jpeg;base64,${b64}`;
        setCropUri(uri);
        if (!initialMarks?.length) {
          // Assume Android-style 200×200 crop; source dims from box frame if unknown
          const srcW = Math.max(box.x2 + 1, 1);
          const srcH = Math.max(box.y2 + 1, 1);
          Image.getSize(
            faceUri,
            (w, h) => {
              setMarks(mapLandmarksToCrop(box, w, h, 200, 200));
            },
            () => {
              setMarks(mapLandmarksToCrop(box, srcW, srcH, 200, 200));
            }
          );
        }
      } catch {
        setCropUri(faceUri);
      }
      const settings = await loadSettings();
      setRows(resultDetailRows(box, settings, { includeMatch: false }));
    })();
  }, [faceUri, box, initialMarks]);

  return (
    <View style={styles.root}>
      <Text style={styles.header}>Attribute Result</Text>
      <View style={styles.card}>
        <LandmarkImage
          uri={cropUri}
          landmarks={marks}
          imageSize={{ w: 200, h: 200 }}
          width={240}
          height={240}
        />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {rows.map((row, i) =>
          row.kind === 'section' ? (
            <Text key={`s-${i}`} style={styles.section}>
              {row.title}
            </Text>
          ) : (
            <View key={`f-${i}`} style={styles.fieldBlock}>
              <Text style={styles.fieldTitle}>{row.title}</Text>
              <Text style={styles.fieldValue} selectable>
                {row.value}
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.blackBg },
  content: { paddingBottom: 32 },
  header: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    height: 48,
    lineHeight: 48,
  },
  card: {
    width: 240,
    height: 240,
    alignSelf: 'center',
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.blackBg,
    elevation: 8,
  },
  scroll: { flex: 1, marginTop: 8 },
  section: {
    color: colors.accent,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  fieldBlock: { paddingHorizontal: 16, marginTop: 10 },
  fieldTitle: { color: colors.muted, fontSize: 13 },
  fieldValue: { color: colors.text, fontSize: 16, marginTop: 2 },
});
