/**
 * Capture UI entry — import from `face-recognition-sdk/capture`.
 * Peers: react-native-vision-camera, react-native-svg.
 */

export type { CaptureSettings, CaptureResult } from './types';
export { DEFAULT_CAPTURE_SETTINGS, toCaptureSettings } from './types';

export {
  checkFace,
  getROIRect,
  getROIRect1,
  mapRoiToView,
  mapFramePoint,
  mapLandmarksToCrop,
  mergeEyes,
  mergeLiveness,
  hasLiveness,
  warningFor,
  type CaptureState,
  type FrameSize,
} from './captureLogic';

export {
  parseVideoWorkerEvent,
  workerFaceToBox,
  type VideoWorkerEvent,
  type VideoWorkerFace,
  type VideoWorkerMatch,
  type VideoWorkerMatchEvent,
  type VideoWorkerTracking,
} from './videoWorker';

export {
  default as CaptureOverlay,
  type CaptureViewMode,
} from './CaptureOverlay';

export { FaceCapture, type FaceCaptureProps } from './FaceCapture';
