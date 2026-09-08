export type RootStackParamList = {
  Home: undefined;
  /** Live identify — Android CameraActivity */
  Identify: undefined;
  /** Live capture + enroll — Android CaptureActivity */
  Capture: undefined;
  /** Gallery attribute result — Android AttributeActivity */
  AttributeResult: {
    faceUri: string;
    box: import('face-recognition-sdk').FaceBox;
    cropLandmarks?: { x: number; y: number }[];
  };
  /** Identify match result — Android ResultActivity */
  Result: {
    identifiedUri: string;
    enrolledThumbB64: string | null;
    personName: string;
    similarity: number;
    box: import('face-recognition-sdk').FaceBox;
    cropLandmarks?: { x: number; y: number }[];
  };
  Settings: undefined;
  About: undefined;
};
