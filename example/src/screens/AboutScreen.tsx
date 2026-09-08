import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getLicenseStatus, parseLicenseStatus } from 'face-recognition-sdk';
import FacePluginLogo from '../components/FacePluginLogo';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export default function AboutScreen({}: Props) {
  const [licenseText, setLicenseText] = useState('License: …');
  const openSite = () => Linking.openURL('https://faceplugin.com');

  useEffect(() => {
    let cancelled = false;
    getLicenseStatus()
      .then((json) => {
        if (!cancelled) {
          setLicenseText(`License: ${parseLicenseStatus(json).label}`);
        }
      })
      .catch(() => {
        if (!cancelled) setLicenseText('License: Not licensed');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <FacePluginLogo style={styles.logo} onPress={openSite} />
      <Text style={styles.company}>FacePlugin</Text>
      <Text style={styles.product}>Face Recognition SDK</Text>

      <View style={styles.licenseCard}>
        <Text style={styles.license}>{licenseText}</Text>
      </View>

      <Text style={styles.card}>
        FacePlugin builds on-device identity technology — face recognition,
        liveness, and document reading — so biometric data never has to leave
        the phone.
      </Text>
      <Text style={styles.card}>
        This app demos the Face Recognition SDK for React Native: enroll,
        identify, capture, and attribute analysis. Everything runs fully
        on-premise.
      </Text>

      <Text style={styles.link} onPress={openSite}>
        faceplugin.com
      </Text>

      <Text style={styles.copy}>© 2026 FacePlugin. All rights reserved.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  logo: { marginTop: 24, alignSelf: 'center' },
  company: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  product: {
    color: colors.accent,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  licenseCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
    padding: 12,
    marginBottom: 4,
  },
  license: {
    color: colors.text,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stroke,
    padding: 16,
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.accent,
    fontSize: 14,
    padding: 8,
  },
  copy: {
    marginTop: 24,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
  },
});
