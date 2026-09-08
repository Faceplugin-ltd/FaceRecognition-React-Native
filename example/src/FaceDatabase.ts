import AsyncStorage from '@react-native-async-storage/async-storage';

const PEOPLE_KEY = 'face_enrolled_people_v1';
const SETTINGS_KEY = 'face_settings_sdk_v1';

export type EnrolledPerson = {
  id: string;
  name: string;
  featureB64: string;
  thumbB64: string | null;
};

export type AppSettings = {
  camera_lens: 'front' | 'back';
  liveness_threshold: number;
  liveness_level: 0 | 1;
  identify_threshold: number;
  yaw_threshold: number;
  roll_threshold: number;
  pitch_threshold: number;
  eyeclose_threshold: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  camera_lens: 'front',
  liveness_threshold: 0.5,
  liveness_level: 0,
  identify_threshold: 0.67,
  yaw_threshold: 40,
  roll_threshold: 40,
  pitch_threshold: 40,
  eyeclose_threshold: 0.5,
};

export async function loadPeople(): Promise<EnrolledPerson[]> {
  const raw = await AsyncStorage.getItem(PEOPLE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function savePeople(people: EnrolledPerson[]): Promise<void> {
  await AsyncStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
}

export async function addPerson(
  name: string,
  featureB64: string,
  thumbB64: string | null
): Promise<EnrolledPerson> {
  const people = await loadPeople();
  const person: EnrolledPerson = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    featureB64,
    thumbB64,
  };
  people.push(person);
  await savePeople(people);
  return person;
}

export async function deletePerson(id: string): Promise<void> {
  const people = await loadPeople();
  await savePeople(people.filter((p) => p.id !== id));
}

export async function clearAllPeople(): Promise<void> {
  await AsyncStorage.removeItem(PEOPLE_KEY);
}

export function autoPersonName(): string {
  return `Person${10000 + Math.floor(Math.random() * 10000)}`;
}

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const p = JSON.parse(raw);
    return {
      camera_lens: p.camera_lens === 'back' ? 'back' : 'front',
      liveness_threshold: num(p.liveness_threshold, DEFAULT_SETTINGS.liveness_threshold),
      liveness_level: p.liveness_level === 1 ? 1 : 0,
      identify_threshold: num(p.identify_threshold, DEFAULT_SETTINGS.identify_threshold),
      yaw_threshold: num(p.yaw_threshold, DEFAULT_SETTINGS.yaw_threshold),
      roll_threshold: num(p.roll_threshold, DEFAULT_SETTINGS.roll_threshold),
      pitch_threshold: num(p.pitch_threshold, DEFAULT_SETTINGS.pitch_threshold),
      eyeclose_threshold: num(p.eyeclose_threshold, DEFAULT_SETTINGS.eyeclose_threshold),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function restoreDefaultSettings(): Promise<AppSettings> {
  const s = { ...DEFAULT_SETTINGS };
  await saveSettings(s);
  return s;
}

export function livenessPassed(
  settings: AppSettings,
  score: number,
  label?: string
): boolean {
  const lower = (label ?? '').toLowerCase();
  if (lower.includes('spoof') || lower.includes('fake')) return false;
  return score >= settings.liveness_threshold;
}

export function qualityText(score: number): string {
  if (score < 0.5) return `Low · ${Math.round(score * 100)}%`;
  if (score < 0.75) return `Medium · ${Math.round(score * 100)}%`;
  return `High · ${Math.round(score * 100)}%`;
}
