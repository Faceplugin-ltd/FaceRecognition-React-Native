import type { FaceBox } from './index';

export type DetailRow = {
  kind: 'section' | 'field';
  title: string;
  value: string;
};

/** Thresholds needed to format result rows (demo Settings stay in the app). */
export type ResultDisplaySettings = {
  liveness_threshold: number;
};

export function livenessPassed(
  settings: ResultDisplaySettings,
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

function genderText(gender: number | undefined, label?: string): string {
  if (label) return label;
  if (gender === 0) return 'Male';
  if (gender === 1) return 'Female';
  return 'Unknown';
}

function livenessText(
  settings: ResultDisplaySettings,
  score: number,
  label?: string
): string {
  const lower = (label ?? '').toLowerCase();
  const live =
    lower.includes('spoof') || lower.includes('fake')
      ? 'Spoof'
      : lower.includes('real')
        ? 'Real'
        : livenessPassed(settings, score, label)
          ? 'Real'
          : 'Spoof';
  if (label?.includes(' · ')) return label;
  return `${live} · ${Math.round(score * 100)}%`;
}

function attrMap(box: FaceBox): Record<string, string> {
  const out: Record<string, string> = {};
  const raw = box.attributes;
  if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw)) {
      if (v != null && String(v).trim()) out[k] = String(v);
    }
  }
  return out;
}

function engineAttr(
  extra: Record<string, string>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const v = extra[key];
    if (v && v.trim()) return v;
  }
  return '';
}

/** Mirrors Android ResultDetails.rows — known fields + leftover engine attributes. */
export function resultDetailRows(
  box: FaceBox,
  settings: ResultDisplaySettings,
  opts?: {
    personName?: string;
    similarity?: number;
    includeMatch?: boolean;
  }
): DetailRow[] {
  const rows: DetailRow[] = [];
  const extra = attrMap(box);
  const used = new Set<string>();
  const push = (title: string, value: string) => {
    if (value.trim()) rows.push({ kind: 'field', title, value });
  };
  const section = (title: string) =>
    rows.push({ kind: 'section', title, value: title });

  const take = (title: string, keys: string[], fallback?: string | null) => {
    const value = engineAttr(extra, ...keys) || fallback || '';
    if (value.trim()) {
      push(title, value);
      keys.forEach((k) => used.add(k));
    }
  };

  if (opts?.includeMatch && opts.personName) {
    section('Match');
    push('Person', opts.personName);
    if (opts.similarity != null) {
      push('Similarity', `${Math.round(opts.similarity * 100)}%`);
    }
  }

  section('Authenticity');
  take(
    'Liveness',
    ['Liveness2D', 'liveness', 'Liveness'],
    livenessText(settings, box.liveness ?? 0, box.livenessLabel)
  );

  section('Person');
  take('Age', ['Age', 'age'], box.age ? String(box.age) : null);
  take('Gender', ['Gender', 'gender'], genderText(box.gender, box.genderLabel));
  take('Emotion', ['Emotion', 'emotion'], box.emotionLabel);
  take('All emotions', ['Emotions']);

  section('Face');
  take('Mask', ['MedicalMask', 'Mask', 'mask'], box.maskLabel);
  take('Glasses', ['Glasses', 'glasses'], box.glassesLabel);
  take('Sunglasses', ['Sunglasses', 'sunglasses'], box.sunglassesLabel);
  take(
    'Occlusion',
    ['Occlusion', 'FaceOcclusion', 'occlusion'],
    box.occlusionLabel
  );
  const left =
    engineAttr(extra, 'EyesLeft', 'eyesLeft') || box.eyesLeftLabel || '';
  const right =
    engineAttr(extra, 'EyesRight', 'eyesRight') || box.eyesRightLabel || '';
  if (left || right) {
    push('Eyes', `Left  ${left || '—'}\nRight  ${right || '—'}`);
    used.add('EyesLeft');
    used.add('EyesRight');
    used.add('eyesLeft');
    used.add('eyesRight');
  }

  section('Quality');
  take(
    'Overall',
    ['FaceQuality', 'ExpressionLevel', 'face_quality'],
    box.qualityLabel || qualityText(box.face_quality ?? 0)
  );
  for (const key of [
    'Lighting',
    'Sharpness',
    'Noise',
    'Flare',
    'BlurLevel',
    'NoiseLevel',
  ]) {
    take(key, [key]);
  }

  section('Geometry');
  push(
    'Pose',
    `yaw ${box.yaw ?? 0}°   roll ${box.roll ?? 0}°   pitch ${box.pitch ?? 0}°`
  );
  push('Box', `${box.x1}, ${box.y1} → ${box.x2}, ${box.y2}`);
  if (box.face_luminance) {
    push('Luminance', `${Math.round((box.face_luminance ?? 0) * 100)}%`);
  }

  const skipLeftover = new Set([
    ...used,
    'MouthOpened',
    'Deepfake',
    'Template',
    'mouth_opened',
  ]);
  const leftovers = Object.entries(extra).filter(
    ([key, value]) =>
      value.trim() &&
      !skipLeftover.has(key) &&
      !rows.some(
        (r) =>
          r.kind === 'field' && r.title.toLowerCase() === key.toLowerCase()
      )
  );
  if (leftovers.length) {
    section('More from engine');
    for (const [key, value] of leftovers) {
      push(key, value);
    }
  }

  if (box.landmarkCount && box.landmarks?.length) {
    section('Landmarks');
    push('Count', `${box.landmarkCount} points`);
    const n = Math.min(
      box.landmarkCount,
      Math.floor((box.landmarks?.length ?? 0) / 2)
    );
    if (n > 0) {
      const lines: string[] = [];
      for (let i = 0; i < n; i++) {
        lines.push(
          `${i + 1}: ${box.landmarks![i * 2]}, ${box.landmarks![i * 2 + 1]}`
        );
      }
      push('Positions', lines.join('\n'));
    }
  }

  return rows.filter((row, i) => {
    if (row.kind !== 'section') return row.value.trim().length > 0;
    const next = rows[i + 1];
    return next != null && next.kind === 'field' && next.value.trim().length > 0;
  });
}
