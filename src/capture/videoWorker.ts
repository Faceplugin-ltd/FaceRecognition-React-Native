import type { FaceBox } from '../index';

export type VideoWorkerMatch = {
  matched: boolean;
  personIndex?: number;
  score?: number;
};

export type VideoWorkerFace = {
  trackId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  landmarks: { x: number; y: number }[];
  yaw: number;
  pitch: number;
  roll: number;
  weak: boolean;
  match?: VideoWorkerMatch;
  liveness?: number;
  livenessLabel?: string;
};

export type VideoWorkerTracking = {
  type: 'tracking';
  frameWidth: number;
  frameHeight: number;
  faces: VideoWorkerFace[];
};

export type VideoWorkerMatchEvent = {
  type: 'match';
  trackId: number;
  matched: boolean;
  personIndex?: number;
  score?: number;
};

export type VideoWorkerEvent = VideoWorkerTracking | VideoWorkerMatchEvent;

function num(v: unknown): number | undefined {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function parseWorkerLiveness(raw: Record<string, unknown>): {
  liveness?: number;
  livenessLabel?: string;
} {
  let liveness = num(raw.liveness);
  let livenessLabel =
    typeof raw.livenessLabel === 'string'
      ? raw.livenessLabel
      : typeof raw.liveness_label === 'string'
        ? raw.liveness_label
        : undefined;
  if (livenessLabel === '') livenessLabel = undefined;
  const attrs = raw.attributes as Record<string, unknown> | undefined;
  const live = (attrs?.Liveness2D ?? attrs?.liveness) as
    | Record<string, unknown>
    | undefined;
  if (live) {
    if (!livenessLabel && typeof live.value === 'string' && live.value) {
      livenessLabel = live.value;
    }
    if (liveness == null) liveness = num(live.confidence) ?? num(live.value);
  }
  return { liveness, livenessLabel };
}

function parseLandmarks(raw: unknown): { x: number; y: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => ({
      x: num((p as any)?.x) ?? 0,
      y: num((p as any)?.y) ?? 0,
    }))
    .filter((p) => p.x !== 0 || p.y !== 0);
}

function parseWorkerFace(raw: Record<string, unknown>): VideoWorkerFace | null {
  const region = raw.faceRegion as Record<string, unknown> | undefined;
  if (!region) return null;
  const x = num(region.x) ?? 0;
  const y = num(region.y) ?? 0;
  const w = num(region.width) ?? 0;
  const h = num(region.height) ?? 0;
  const matchRaw = raw.match as Record<string, unknown> | undefined;
  let match: VideoWorkerMatch | undefined;
  if (matchRaw) {
    match = {
      matched: Boolean(matchRaw.matched),
      personIndex: num(matchRaw.person_index),
      score: num(matchRaw.score),
    };
  }
  const pose = (raw.facePose as Record<string, unknown> | undefined) ?? undefined;
  const live = parseWorkerLiveness(raw);
  return {
    trackId: num(raw.track_id) ?? 0,
    x,
    y,
    width: w,
    height: h,
    landmarks: parseLandmarks(raw.facePoints),
    yaw: num(pose?.yaw) ?? 0,
    pitch: num(pose?.pitch) ?? 0,
    roll: num(pose?.roll) ?? 0,
    weak: Boolean(raw.weak),
    match,
    liveness: live.liveness,
    livenessLabel: live.livenessLabel,
  };
}

export function parseVideoWorkerEvent(json: string): VideoWorkerEvent | null {
  try {
    const root = JSON.parse(json);
    const event = root?.event;
    if (event === 'tracking') {
      const facesRaw = Array.isArray(root.faces) ? root.faces : [];
      return {
        type: 'tracking',
        frameWidth: num(root.frame_width) ?? 0,
        frameHeight: num(root.frame_height) ?? 0,
        faces: facesRaw
          .map((f: unknown) =>
            f && typeof f === 'object'
              ? parseWorkerFace(f as Record<string, unknown>)
              : null
          )
          .filter(Boolean) as VideoWorkerFace[],
      };
    }
    if (event === 'match') {
      return {
        type: 'match',
        trackId: num(root.track_id) ?? 0,
        matched: Boolean(root.matched),
        personIndex: num(root.person_index),
        score: num(root.score),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function workerFaceToBox(face: VideoWorkerFace): FaceBox {
  return {
    x1: Math.round(face.x),
    y1: Math.round(face.y),
    x2: Math.round(face.x + face.width),
    y2: Math.round(face.y + face.height),
    yaw: face.yaw,
    pitch: face.pitch,
    roll: face.roll,
    liveness: face.liveness,
    livenessLabel: face.livenessLabel,
    landmarkCount: face.landmarks.length,
    landmarks: face.landmarks.flatMap((p) => [p.x, p.y]),
  };
}
