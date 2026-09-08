import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadSettings } from '../FaceDatabase';
import { resultDetailRows } from '../resultDetails';
import LandmarkImage from '../components/LandmarkImage';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route }: Props) {
  const {
    identifiedUri,
    enrolledThumbB64,
    personName,
    similarity,
    box,
    cropLandmarks = [],
  } = route.params;
  const [rows, setRows] = useState<
    { kind: 'section' | 'field'; title: string; value: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      const settings = await loadSettings();
      // Android ResultActivity: includeMatch = false (match shown in header)
      setRows(resultDetailRows(box, settings, { includeMatch: false }));
    })();
  }, [box]);

  return (
    <View style={styles.root}>
      <Text style={styles.header}>Identify Result</Text>
      <View style={styles.row}>
        <View style={styles.photoCol}>
          <LandmarkImage
            uri={identifiedUri}
            landmarks={cropLandmarks}
            imageSize={{ w: 200, h: 200 }}
            width={140}
            height={140}
          />
          <Text style={styles.caption}>Identified</Text>
        </View>
        <View style={styles.photoCol}>
          {enrolledThumbB64 ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${enrolledThumbB64}` }}
              style={styles.photo}
            />
          ) : (
            <View style={[styles.photo, styles.photoEmpty]} />
          )}
          <Text style={styles.caption}>Enrolled</Text>
          <Text style={styles.personId}>ID: {personName}</Text>
        </View>
      </View>
      <Text style={styles.similarity}>Similarity: {similarity}</Text>
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
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  photoCol: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 8,
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: colors.background1,
  },
  photoEmpty: { opacity: 0.3 },
  caption: { color: colors.text, marginTop: 5, padding: 5 },
  personId: { color: colors.muted, fontSize: 13, marginBottom: 5 },
  similarity: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 18,
    paddingTop: 8,
  },
  scroll: { flex: 1, marginTop: 8 },
  section: {
    color: colors.accent,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 20,
    marginHorizontal: 16,
  },
  fieldBlock: { paddingHorizontal: 16, marginTop: 10 },
  fieldTitle: { color: colors.muted, fontSize: 13 },
  fieldValue: { color: colors.text, fontSize: 16, marginTop: 2 },
});
