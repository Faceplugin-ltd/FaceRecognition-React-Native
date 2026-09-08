/**
 * Canonical FaceBox schema matches iOS bridge output:
 * - `attributes`: PascalCase engine map (`"value"` or `"value · NN%"`)
 * - convenience labels: glassesLabel, sunglassesLabel, occlusionLabel, …
 *
 * Android typed FaceBox JSON often omits `attributes` and some labels.
 * This middleware fills the iOS shape without inventing glasses/sunglasses
 * when the engine never returned them.
 */

export type FaceBoxLike = {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  yaw?: number;
  roll?: number;
  pitch?: number;
  liveness?: number;
  face_quality?: number;
  face_luminance?: number;
  left_eye_closed?: number;
  right_eye_closed?: number;
  face_occlusion?: number;
  mouth_opened?: number;
  age?: number;
  gender?: number;
  livenessLabel?: string;
  genderLabel?: string;
  emotionLabel?: string;
  maskLabel?: string;
  qualityLabel?: string;
  eyesLeftLabel?: string;
  eyesRightLabel?: string;
  glassesLabel?: string;
  sunglassesLabel?: string;
  occlusionLabel?: string;
  attributes?: Record<string, string>;
  landmarkCount?: number;
  landmarks?: number[];
  [key: string]: unknown;
};

function trimStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v != null ? String(v).trim() : '';
}

/** Prefer existing "value · NN%" labels; otherwise append score when 0–1. */
function fmtAttr(label: string, score?: number): string {
  const l = trimStr(label);
  if (!l && (score == null || !Number.isFinite(score))) return '';
  if (l.includes(' · ')) return l;
  if (
    l &&
    score != null &&
    Number.isFinite(score) &&
    score >= 0 &&
    score <= 1
  ) {
    return `${l} · ${Math.round(score * 100)}%`;
  }
  return l;
}

function occlusionFromScore(score: number | undefined): string {
  if (score == null || !Number.isFinite(score) || score <= 0.001) return '';
  if (score > 0.5) return `Occluded · ${Math.round(score * 100)}%`;
  return `Clear · ${Math.round((1 - score) * 100)}%`;
}

function put(
  attrs: Record<string, string>,
  key: string,
  value: string
): void {
  const v = trimStr(value);
  if (v) attrs[key] = v;
}

/**
 * Identity when `attributes` is already present (iOS / already normalized).
 * Otherwise synthesize an iOS-shaped `attributes` map from typed fields.
 */
export function normalizeFaceBox(box: FaceBoxLike): FaceBoxLike {
  if (box == null || typeof box !== 'object') {
    return box;
  }

  // iOS always sets attributes (even {}); Android faceBoxToJson omits it.
  if (box.attributes != null && typeof box.attributes === 'object') {
    return box;
  }

  const attributes: Record<string, string> = {};
  put(attributes, 'Age', box.age ? String(box.age) : '');
  put(attributes, 'Gender', String(box.genderLabel ?? ''));
  put(attributes, 'Emotion', String(box.emotionLabel ?? ''));
  put(attributes, 'MedicalMask', String(box.maskLabel ?? ''));
  put(
    attributes,
    'Liveness2D',
    fmtAttr(String(box.livenessLabel ?? ''), box.liveness)
  );
  put(
    attributes,
    'FaceQuality',
    trimStr(box.qualityLabel) ||
      (box.face_quality != null && box.face_quality > 0
        ? String(box.face_quality)
        : '')
  );
  put(attributes, 'EyesLeft', String(box.eyesLeftLabel ?? ''));
  put(attributes, 'EyesRight', String(box.eyesRightLabel ?? ''));
  put(attributes, 'Glasses', String(box.glassesLabel ?? ''));
  put(attributes, 'Sunglasses', String(box.sunglassesLabel ?? ''));

  const occlusionLabel =
    trimStr(box.occlusionLabel) || occlusionFromScore(box.face_occlusion);
  put(attributes, 'Occlusion', occlusionLabel);

  return {
    ...box,
    glassesLabel: box.glassesLabel ?? '',
    sunglassesLabel: box.sunglassesLabel ?? '',
    occlusionLabel: occlusionLabel || box.occlusionLabel || '',
    attributes,
  };
}

export function normalizeFaceBoxes(boxes: FaceBoxLike[]): FaceBoxLike[] {
  if (!Array.isArray(boxes)) return [];
  return boxes.map((b) => normalizeFaceBox(b));
}
