import type { FaceBox } from '../index';

/**
 * Thresholds + camera lens for Capture UI.
 * Plain object — no AsyncStorage. Apps/examples pass their own settings.
 */
export type CaptureSettings = {
  camera_lens: 'front' | 'back';
  liveness_threshold: number;
  liveness_level: 0 | 1;
  yaw_threshold: number;
  roll_threshold: number;
  pitch_threshold: number;
  eyeclose_threshold: number;
};

export const DEFAULT_CAPTURE_SETTINGS: CaptureSettings = {
  camera_lens: 'front',
  liveness_threshold: 0.5,
  liveness_level: 0,
  yaw_threshold: 40,
  roll_threshold: 40,
  pitch_threshold: 40,
  eyeclose_threshold: 0.5,
};

/** Map demo / app settings onto Capture thresholds (one source of truth). */
export function toCaptureSettings(s: {
  camera_lens: 'front' | 'back';
  liveness_threshold: number;
  liveness_level: 0 | 1;
  yaw_threshold: number;
  roll_threshold: number;
  pitch_threshold: number;
  eyeclose_threshold: number;
}): CaptureSettings {
  return {
    camera_lens: s.camera_lens,
    liveness_threshold: s.liveness_threshold,
    liveness_level: s.liveness_level,
    yaw_threshold: s.yaw_threshold,
    roll_threshold: s.roll_threshold,
    pitch_threshold: s.pitch_threshold,
    eyeclose_threshold: s.eyeclose_threshold,
  };
}

export type CaptureResult = {
  /** Prepared live frame URI (JPEG) used for the successful capture. */
  uri: string;
  faceBox: FaceBox;
  /** Optional face crop JPEG as base64 (NO_WRAP), when available. */
  cropB64?: string | null;
};
