import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  DEFAULT_SETTINGS,
  clearAllPeople,
  loadSettings,
  restoreDefaultSettings,
  saveSettings,
  type AppSettings,
} from '../FaceDatabase';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function toast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('', msg);
}

function inRange(v: number, min: number, max: number) {
  return Number.isFinite(v) && v >= min && v <= max;
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        keyboardType="decimal-pad"
        onChangeText={onChange}
      />
    </View>
  );
}

export default function SettingsScreen({}: Props) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setDraft({
        liveness_threshold: String(s.liveness_threshold),
        identify_threshold: String(s.identify_threshold),
        yaw_threshold: String(s.yaw_threshold),
        roll_threshold: String(s.roll_threshold),
        pitch_threshold: String(s.pitch_threshold),
        eyeclose_threshold: String(s.eyeclose_threshold),
      });
    });
  }, []);

  const commit = async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveSettings(next);
  };

  const commitNum = async (
    key: keyof AppSettings,
    raw: string,
    min: number,
    max: number
  ) => {
    setDraft((d) => ({ ...d, [key]: raw }));
    const v = parseFloat(raw);
    if (!inRange(v, min, max)) return;
    await commit({ [key]: v } as Partial<AppSettings>);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Camera</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Camera lens</Text>
        <View style={styles.radioRow}>
          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => commit({ camera_lens: 'front' })}
          >
            <View
              style={[
                styles.radioDot,
                settings.camera_lens === 'front' && styles.radioDotOn,
              ]}
            />
            <Text style={styles.radioLabel}>Front</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => commit({ camera_lens: 'back' })}
          >
            <View
              style={[
                styles.radioDot,
                settings.camera_lens === 'back' && styles.radioDotOn,
              ]}
            />
            <Text style={styles.radioLabel}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Thresholds</Text>
      <View style={styles.card}>
        <NumField
          label="Liveness"
          value={draft.liveness_threshold ?? ''}
          onChange={(v) => commitNum('liveness_threshold', v, 0, 1)}
        />
        <Text style={styles.cardLabel}>Liveness Level</Text>
        <View style={styles.radioRow}>
          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => commit({ liveness_level: 0 })}
          >
            <View
              style={[
                styles.radioDot,
                settings.liveness_level === 0 && styles.radioDotOn,
              ]}
            />
            <Text style={styles.radioLabel}>High Accuracy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => commit({ liveness_level: 1 })}
          >
            <View
              style={[
                styles.radioDot,
                settings.liveness_level === 1 && styles.radioDotOn,
              ]}
            />
            <Text style={styles.radioLabel}>Light Weight</Text>
          </TouchableOpacity>
        </View>
        <NumField
          label="Identify"
          value={draft.identify_threshold ?? ''}
          onChange={(v) => commitNum('identify_threshold', v, 0, 1)}
        />
        <NumField
          label="Yaw"
          value={draft.yaw_threshold ?? ''}
          onChange={(v) => commitNum('yaw_threshold', v, 0, 90)}
        />
        <NumField
          label="Roll"
          value={draft.roll_threshold ?? ''}
          onChange={(v) => commitNum('roll_threshold', v, 0, 90)}
        />
        <NumField
          label="Pitch"
          value={draft.pitch_threshold ?? ''}
          onChange={(v) => commitNum('pitch_threshold', v, 0, 90)}
        />
        <NumField
          label="Eye closed"
          value={draft.eyeclose_threshold ?? ''}
          onChange={(v) => commitNum('eyeclose_threshold', v, 0, 1)}
        />
      </View>

      <Text style={styles.sectionTitle}>Reset</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={async () => {
            const s = await restoreDefaultSettings();
            setSettings(s);
            setDraft({
              liveness_threshold: String(s.liveness_threshold),
              identify_threshold: String(s.identify_threshold),
              yaw_threshold: String(s.yaw_threshold),
              roll_threshold: String(s.roll_threshold),
              pitch_threshold: String(s.pitch_threshold),
              eyeclose_threshold: String(s.eyeclose_threshold),
            });
            toast('Restored default settings');
          }}
        >
          <Text style={styles.actionText}>Restore default settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={async () => {
            await clearAllPeople();
            toast('Cleared all person');
          }}
        >
          <Text style={styles.actionText}>Clear all person</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: {
    color: colors.accent,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cardLabel: { color: colors.text, fontSize: 15, marginBottom: 8 },
  radioRow: { flexDirection: 'row', gap: 24, marginBottom: 12 },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  radioDotOn: { backgroundColor: colors.accent },
  radioLabel: { color: colors.text, fontSize: 15 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.stroke,
  },
  fieldLabel: { color: colors.text, fontSize: 15, flex: 1 },
  input: {
    color: colors.text,
    fontSize: 15,
    minWidth: 72,
    textAlign: 'right',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.background1,
    borderRadius: 6,
  },
  actionRow: {
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.stroke,
  },
  actionText: { color: colors.text, fontSize: 15 },
});
