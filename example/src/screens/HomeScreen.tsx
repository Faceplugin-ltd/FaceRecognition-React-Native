import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  cropFace,
  faceDetection,
  templateExtraction,
} from 'face-recognition-sdk';
import { useSdk } from '../SdkContext';
import {
  addPerson,
  autoPersonName,
  deletePerson,
  loadPeople,
  loadSettings,
  type EnrolledPerson,
} from '../FaceDatabase';
import { mapLandmarksToCrop } from 'face-recognition-sdk/capture';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const TILES = {
  enroll: require('../assets/tiles/enroll.png'),
  identify: require('../assets/tiles/identify.png'),
  capture: require('../assets/tiles/capture.png'),
  attribute: require('../assets/tiles/attributr.png'),
  settings: require('../assets/tiles/settings.png'),
  about: require('../assets/tiles/information.png'),
} as const;

function toast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('', msg);
}

function Tile({
  title,
  icon,
  disabled,
  onPress,
  flex = 1,
}: {
  title: string;
  icon: ImageSourcePropType;
  disabled?: boolean;
  onPress: () => void;
  flex?: number;
}) {
  return (
    <TouchableOpacity
      style={[styles.tile, { flex }, disabled && styles.tileDisabled]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Image source={icon} style={styles.tileIcon} resizeMode="contain" />
      <Text style={styles.tileTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { ready, loading, status } = useSdk();
  const [people, setPeople] = useState<EnrolledPerson[]>([]);

  const refreshPeople = useCallback(async () => {
    setPeople(await loadPeople());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPeople();
    }, [refreshPeople])
  );

  const guard = (go: () => void) => {
    if (!ready) {
      toast(loading ? 'Loading native SDK…' : 'SDK not ready');
      return;
    }
    go();
  };

  const enrollFromGallery = async () => {
    const picked = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.95,
    });
    const uri = picked.assets?.[0]?.uri;
    if (!uri) return;
    try {
      const boxes = await faceDetection(uri, { allAttributes: false });
      if (boxes.length !== 1) {
        toast(
          boxes.length === 0 ? 'No face detected!' : 'Multiple face detected!'
        );
        return;
      }
      const feature = await templateExtraction(uri, boxes[0]);
      let thumb: string | null = null;
      try {
        thumb = await cropFace(uri, boxes[0]);
      } catch {
        thumb = null;
      }
      await addPerson(autoPersonName(), feature, thumb);
      await refreshPeople();
      toast('Person enrolled!');
    } catch (e: any) {
      toast(e?.message ?? 'Enrollment failed');
    }
  };

  const attributeFromGallery = async () => {
    const picked = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.95,
    });
    const uri = picked.assets?.[0]?.uri;
    if (!uri) return;
    try {
      const settings = await loadSettings();
      const boxes = await faceDetection(uri, {
        allAttributes: true,
        check_liveness_level: settings.liveness_level,
      });
      if (boxes.length !== 1) {
        toast(
          boxes.length === 0 ? 'No face detected!' : 'Multiple face detected!'
        );
        return;
      }
      navigation.navigate('AttributeResult', {
        faceUri: uri,
        box: boxes[0],
        cropLandmarks: await new Promise<{ x: number; y: number }[]>(
          (resolve) => {
            Image.getSize(
              uri,
              (w, h) => resolve(mapLandmarksToCrop(boxes[0], w, h, 200, 200)),
              () => resolve([])
            );
          }
        ),
      });
    } catch (e: any) {
      toast(e?.message ?? 'Could not load image');
    }
  };

  const showWarning = !ready && status.length > 0;

  return (
    <View style={styles.root}>
      <Text style={styles.headerTitle}>Face Recognition</Text>
      {status.length > 0 ? (
        <Text
          style={[
            styles.statusLine,
            { color: ready ? colors.statusOk : colors.muted },
          ]}
        >
          {status}
        </Text>
      ) : null}

      <View style={styles.row}>
        <Tile
          title="ENROLL"
          icon={TILES.enroll}
          disabled={!ready}
          onPress={() => guard(() => enrollFromGallery())}
        />
        <View style={styles.gap} />
        <Tile
          title="IDENTIFY"
          icon={TILES.identify}
          disabled={!ready}
          onPress={() => guard(() => navigation.navigate('Identify'))}
        />
        <View style={styles.gap} />
        <Tile
          title="CAPTURE"
          icon={TILES.capture}
          disabled={!ready}
          onPress={() => guard(() => navigation.navigate('Capture'))}
        />
      </View>

      <View style={styles.row}>
        <Tile
          title="ATTRIBUTE"
          icon={TILES.attribute}
          disabled={!ready}
          onPress={() => guard(() => attributeFromGallery())}
        />
        <View style={styles.gap} />
        <Tile
          title="SETTINGS"
          icon={TILES.settings}
          onPress={() => navigation.navigate('Settings')}
        />
        <View style={styles.gap} />
        <Tile
          title="ABOUT"
          icon={TILES.about}
          onPress={() => navigation.navigate('About')}
        />
      </View>

      {people.length > 0 ? (
        <Text style={styles.enrolledLabel}>Enrolled Face</Text>
      ) : null}

      <View style={styles.listWrap}>
        {showWarning ? (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>{status}</Text>
          </View>
        ) : null}
        <FlatList
          data={people}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !showWarning ? (
              <Text style={styles.emptyHint}>
                {ready ? 'No enrolled faces yet.' : ''}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.personCard}>
              {item.thumbB64 ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${item.thumbB64}` }}
                  style={styles.personThumb}
                />
              ) : (
                <View style={[styles.personThumb, styles.personThumbEmpty]} />
              )}
              <Text style={styles.personName} numberOfLines={1}>
                {item.name}
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  await deletePerson(item.id);
                  refreshPeople();
                }}
                hitSlop={8}
              >
                <Text style={styles.deleteBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    height: 48,
    lineHeight: 48,
  },
  statusLine: {
    textAlign: 'center',
    fontSize: 13,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    height: 120,
  },
  gap: { width: 16 },
  tile: {
    backgroundColor: colors.tile,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileDisabled: { opacity: 0.45 },
  tileIcon: { width: 56, height: 56 },
  tileTitle: {
    color: colors.onPrimary,
    fontSize: 15,
    marginTop: 8,
    fontWeight: '500',
  },
  enrolledLabel: {
    color: colors.text,
    fontSize: 20,
    marginTop: 30,
    marginLeft: 16,
  },
  listWrap: { flex: 1, marginTop: 10 },
  listContent: { paddingBottom: 24 },
  warningBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '40%',
    zIndex: 2,
    backgroundColor: colors.statusError,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  warningText: { color: colors.onPrimary, textAlign: 'center', fontSize: 14 },
  emptyHint: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background1,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 72,
  },
  personThumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
  },
  personThumbEmpty: { opacity: 0.35 },
  personName: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    marginLeft: 10,
  },
  deleteBtn: { color: colors.muted, fontSize: 18, padding: 4 },
});
