import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  type EmitterSubscription,
} from 'react-native';
import {
  normalizeFaceBox,
  normalizeFaceBoxes,
} from './normalizeFaceBox';
import {
  planLiveFrame,
  LIVE_FRAME_MAX_EDGE,
} from './liveFramePrep';
import {
  parseVideoWorkerEvent,
  type VideoWorkerEvent,
} from './capture/videoWorker';
import {
  resultDetailRows,
  livenessPassed,
  qualityText,
  type DetailRow,
  type ResultDisplaySettings,
} from './resultDetails';

const LINKING_ERROR =
  `The package 'face-recognition-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const FaceRecognitionSdk = NativeModules.FaceRecognitionSdk
  ? NativeModules.FaceRecognitionSdk
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const emitter = new NativeEventEmitter(FaceRecognitionSdk);

export type ImageInput = string;

/** VisionCamera takeSnapshot()-like object, or any { path, orientation? }. */
export type LiveCameraPhoto = {
  path: string;
  orientation?: string;
  width?: number;
  height?: number;
};

export type LiveFrameInput = ImageInput | LiveCameraPhoto;

export type LiveFrameOptions = {
  /** Front camera → package applies sensor mount correction. Default true. */
  frontCamera?: boolean;
  /** VisionCamera orientation tag (optional; size after probe drives rotation). */
  orientation?: string;
  /** Advanced: skip policy and rotate by this many degrees. */
  rotateDegrees?: number;
  /** Long-edge cap (default 640). */
  maxEdge?: number;
};

export type FaceBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
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
  /** Full engine attribute map (PascalCase keys) for Attribute Result UI. */
  attributes?: Record<string, string>;
  landmarkCount?: number;
  landmarks?: number[];
};

export type FaceDetectionParam = {
  allAttributes?: boolean;
  check_liveness?: boolean;
  check_liveness_level?: number;
  check_eye_closeness?: boolean;
  check_face_occlusion?: boolean;
  estimate_age_gender?: boolean;
  check_pose?: boolean;
  check_landmarks?: boolean;
  check_quality?: boolean;
  check_emotion?: boolean;
  check_mask?: boolean;
  check_glasses?: boolean;
};

export type VideoWorkerConfig = {
  matchThreshold?: number;
};

/** FPMC1.… machine code for license requests. */
export function getMachineCode(): Promise<string> {
  return FaceRecognitionSdk.getMachineCode();
}

/** License tier JSON: licensed, level, recognition, liveness, label. */
export function getLicenseStatus(): Promise<string> {
  return FaceRecognitionSdk.getLicenseStatus();
}

/** Activate with FP1.… bound to applicationId / bundle id. Returns SDK status code. */
export function setActivation(license: string): Promise<number> {
  return FaceRecognitionSdk.setActivation(license);
}

/** Load engine + models (off JS thread). Returns SDK status code (0 = success). */
export function init(): Promise<number> {
  return FaceRecognitionSdk.init();
}

export function deinit(): Promise<void> {
  return FaceRecognitionSdk.deinit();
}

export function lastLicenseError(): Promise<string> {
  return FaceRecognitionSdk.lastLicenseError();
}

export function setLandmarkMode(mode: number): Promise<number> {
  return FaceRecognitionSdk.setLandmarkMode(mode);
}

export function getLandmarkMode(): Promise<number> {
  return FaceRecognitionSdk.getLandmarkMode();
}

/** Detect faces + attributes. Returns engine JSON string. */
export function detect(
  image: ImageInput,
  crop: boolean = false,
  flags: number = DETECT_ALL
): Promise<string> {
  return FaceRecognitionSdk.detect(image, crop, flags);
}

/**
 * Structured face boxes (canonical iOS schema).
 * Android bridge output is normalized so `attributes` + label fields match iOS.
 */
export async function faceDetection(
  image: ImageInput,
  param?: FaceDetectionParam | null
): Promise<FaceBox[]> {
  const json = await FaceRecognitionSdk.faceDetection(
    image,
    param ? JSON.stringify(param) : null
  );
  try {
    const parsed = JSON.parse(json);
    return normalizeFaceBoxes(
      Array.isArray(parsed) ? parsed : []
    ) as FaceBox[];
  } catch {
    return [];
  }
}

/** Template bytes as base64 (NO_WRAP). */
export function templateExtraction(
  image: ImageInput,
  faceBox: FaceBox | string
): Promise<string> {
  const boxJson =
    typeof faceBox === 'string' ? faceBox : JSON.stringify(faceBox);
  return FaceRecognitionSdk.templateExtraction(image, boxJson);
}

/** Cropped face JPEG as base64 (NO_WRAP). */
export function cropFace(
  image: ImageInput,
  faceBox: FaceBox | string
): Promise<string> {
  const boxJson =
    typeof faceBox === 'string' ? faceBox : JSON.stringify(faceBox);
  return FaceRecognitionSdk.cropFace(image, boxJson);
}

export function extractFeature(image: ImageInput): Promise<string> {
  return FaceRecognitionSdk.extractFeature(image);
}

export function similarity(
  feature1B64: string,
  feature2B64: string
): Promise<number> {
  return FaceRecognitionSdk.similarity(feature1B64, feature2B64);
}

export function quality(
  image: ImageInput,
  crop: boolean = false
): Promise<string> {
  return FaceRecognitionSdk.quality(image, crop);
}

export function startVideoWorker(
  config: VideoWorkerConfig | string = { matchThreshold: 0.67 }
): Promise<number> {
  const json =
    typeof config === 'string' ? config : JSON.stringify(config ?? {});
  return FaceRecognitionSdk.startVideoWorker(json);
}

export function stopVideoWorker(): Promise<void> {
  return FaceRecognitionSdk.stopVideoWorker();
}

export function syncVideoWorkerDatabase(
  featuresB64: string[],
  matchThreshold: number = 0.67
): Promise<number> {
  return FaceRecognitionSdk.syncVideoWorkerDatabase(
    featuresB64,
    matchThreshold
  );
}

export type LiveFrameResult = {
  ingested: boolean;
  width: number;
  height: number;
  uri?: string | null;
};

function normalizeLiveFrameResult(raw: any): LiveFrameResult {
  return {
    ingested: Boolean(raw?.ingested),
    width: Number(raw?.width) || 0,
    height: Number(raw?.height) || 0,
    uri: typeof raw?.uri === 'string' ? raw.uri : null,
  };
}

function resolveLiveUri(input: LiveFrameInput): string {
  if (typeof input === 'string') {
    if (input.startsWith('file://') || input.startsWith('content:') || input.startsWith('data:')) {
      return input;
    }
    if (input.startsWith('/')) {
      return `file://${input}`;
    }
    return input;
  }
  const path = input?.path;
  if (!path || typeof path !== 'string') {
    throw new Error('ingestLiveCameraFrame: expected a URI string or { path }');
  }
  return path.startsWith('file://') || path.startsWith('content:')
    ? path
    : `file://${path}`;
}

function resolveLiveArgs(
  input: LiveFrameInput | boolean,
  frontOrOptions?: boolean | string | LiveFrameOptions,
  orientationArg?: string
): { uri: string; options: LiveFrameOptions } {
  // Legacy: ingestLiveCameraFrame(uri, frontCamera, orientation)
  if (typeof input === 'string' || (input && typeof input === 'object' && 'path' in input)) {
    if (typeof frontOrOptions === 'boolean') {
      return {
        uri: resolveLiveUri(input as LiveFrameInput),
        options: {
          frontCamera: frontOrOptions,
          orientation:
            typeof orientationArg === 'string'
              ? orientationArg
              : typeof input === 'object'
                ? input.orientation
                : undefined,
        },
      };
    }
    const opts =
      frontOrOptions && typeof frontOrOptions === 'object'
        ? (frontOrOptions as LiveFrameOptions)
        : {};
    const photoOrient =
      typeof input === 'object' && input && 'orientation' in input
        ? (input as LiveCameraPhoto).orientation
        : undefined;
    return {
      uri: resolveLiveUri(input as LiveFrameInput),
      options: {
        frontCamera: opts.frontCamera !== false,
        orientation: opts.orientation ?? photoOrient,
        rotateDegrees: opts.rotateDegrees,
        maxEdge: opts.maxEdge,
      },
    };
  }
  throw new Error('ingestLiveCameraFrame: invalid arguments');
}

async function prepareAndMaybeFeed(
  input: LiveFrameInput,
  frontOrOptions?: boolean | LiveFrameOptions,
  orientationArg?: string,
  feedWorker: boolean = true
): Promise<LiveFrameResult> {
  const { uri, options } = resolveLiveArgs(input, frontOrOptions, orientationArg);
  const maxEdge =
    options.maxEdge != null && options.maxEdge > 0
      ? options.maxEdge
      : LIVE_FRAME_MAX_EDGE;

  let rotateDegrees: number;
  if (options.rotateDegrees != null && Number.isFinite(options.rotateDegrees)) {
    rotateDegrees = options.rotateDegrees;
  } else {
    const probed = await FaceRecognitionSdk.probeLiveImage(uri);
    const plan = planLiveFrame({
      frontCamera: options.frontCamera !== false,
      orientation: options.orientation,
      width: Number(probed?.width) || 0,
      height: Number(probed?.height) || 0,
      maxEdge,
      platform: Platform.OS,
    });
    rotateDegrees = plan.rotateDegrees;
  }

  const raw = await FaceRecognitionSdk.applyLiveFrame(
    uri,
    rotateDegrees,
    maxEdge,
    feedWorker
  );
  return normalizeLiveFrameResult(raw);
}

/**
 * Feed one VisionCamera snapshot (or URI) into VideoWorker.
 *
 * Beginner:
 *   await ingestLiveCameraFrame(photo, { frontCamera: true });
 *
 * Also OK:
 *   await ingestLiveCameraFrame(uri, { frontCamera: true, orientation: 'portrait' });
 *
 * Legacy:
 *   await ingestLiveCameraFrame(uri, true, 'portrait');
 *
 * Geometry (EXIF bake, front 180°, landscape ±90°) is handled inside the package.
 */
export function ingestLiveCameraFrame(
  input: LiveFrameInput,
  frontOrOptions?: boolean | LiveFrameOptions,
  orientation?: string
): Promise<LiveFrameResult> {
  return prepareAndMaybeFeed(input, frontOrOptions, orientation, true);
}

/**
 * Same prep as ingest, but only writes a JPEG (does not feed VideoWorker).
 * Returns file URI of the prepared frame.
 */
export async function prepareLiveCameraFrame(
  input: LiveFrameInput,
  frontOrOptions?: boolean | LiveFrameOptions,
  orientation?: string
): Promise<string> {
  const result = await prepareAndMaybeFeed(
    input,
    frontOrOptions,
    orientation,
    false
  );
  if (!result.uri) {
    throw new Error('prepareLiveCameraFrame: no output URI');
  }
  return result.uri;
}

/**
 * Prep + feed VideoWorker; returns 0 on accept, 1 if the frame was dropped.
 * Prefer `ingestLiveCameraFrame` for new code.
 */
export async function addVideoWorkerFrame(
  input: LiveFrameInput,
  frontOrOptions?: boolean | LiveFrameOptions,
  orientation?: string
): Promise<number> {
  const result = await prepareAndMaybeFeed(
    input,
    frontOrOptions,
    orientation,
    true
  );
  return result.ingested ? 0 : 1;
}

/** JPEG URI of the last ingested live frame (same bitmap space as VideoWorker). */
export function exportLastLiveFrame(): Promise<LiveFrameResult> {
  return FaceRecognitionSdk.exportLastLiveFrame().then(normalizeLiveFrameResult);
}

export function writeStatus(
  payload: Record<string, unknown>
): Promise<void> {
  return FaceRecognitionSdk.writeStatus(JSON.stringify(payload));
}

/** Which attribute estimators loaded at init (JSON string). */
export function estimatorStatus(): Promise<string> {
  return FaceRecognitionSdk.estimatorStatus();
}

/** Device smoke: detect + extract Documents/smoke_face.jpg → facerecognition_smoke.json */
export function runDocumentsSmoke(): Promise<string> {
  return FaceRecognitionSdk.runDocumentsSmoke();
}

/** Subscribe to VideoWorker tracking / match JSON events. */
export function addVideoWorkerListener(
  listener: (json: string) => void
): EmitterSubscription {
  return emitter.addListener('FaceRecognitionVideoWorkerEvent', (event) => {
    listener(typeof event?.json === 'string' ? event.json : '{}');
  });
}

/** Parsed VideoWorker events. Prefer this over raw JSON + parseVideoWorkerEvent. */
export function subscribeVideoWorker(
  cb: (ev: VideoWorkerEvent) => void
): () => void {
  const sub = addVideoWorkerListener((json) => {
    const ev = parseVideoWorkerEvent(json);
    if (ev) cb(ev);
  });
  return () => sub.remove();
}

export const SDK_SUCCESS = 0;
export const SDK_LICENSE_INVALID = 1;
export const SDK_LICENSE_EXPIRED = 2;
export const SDK_NOT_ACTIVATED = 3;
export const SDK_INIT_FAILED = 4;

export const DETECT_POSE = 1 << 0;
export const DETECT_LANDMARKS = 1 << 1;
export const DETECT_AGE = 1 << 2;
export const DETECT_GENDER = 1 << 3;
export const DETECT_EMOTION = 1 << 4;
export const DETECT_MASK = 1 << 5;
export const DETECT_QUALITY = 1 << 6;
export const DETECT_FACE_QUALITY = 1 << 7;
export const DETECT_EYES = 1 << 8;
export const DETECT_LIVENESS = 1 << 9;
export const DETECT_GLASSES = 1 << 11;
export const DETECT_LIVENESS_ACCURATE = 1 << 16;
export const DETECT_ALL = 0xffffffff;

export const LANDMARK_MODE_14 = 14;
export const LANDMARK_MODE_68 = 68;
export const LANDMARK_MODE_468 = 468;

export { normalizeFaceBox, normalizeFaceBoxes };
export { planLiveFrame, LIVE_FRAME_MAX_EDGE };
export { FaceRecognitionSdk };
export {
  resultDetailRows,
  livenessPassed,
  qualityText,
};
export type { DetailRow, ResultDisplaySettings, VideoWorkerEvent };
export {
  parseLicenseStatus,
  readyStatusMessage,
  NOT_LICENSED,
  type LicenseStatus,
} from './licenseStatus';
