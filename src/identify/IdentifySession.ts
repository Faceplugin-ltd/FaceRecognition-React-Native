import { Platform } from 'react-native';
import type { Camera } from 'react-native-vision-camera';
import {
  exportLastLiveFrame,
  faceDetection,
  ingestLiveCameraFrame,
  startVideoWorker,
  stopVideoWorker,
  subscribeVideoWorker,
  syncVideoWorkerDatabase,
  type FaceBox,
} from '../index';
import { workerFaceToBox } from '../capture/videoWorker';
import { mergeLiveness } from '../capture/captureLogic';

export type IdentifySettings = {
  frontCamera: boolean;
  matchThreshold: number;
  livenessLevel: 0 | 1;
  frameIntervalMs?: number;
  livenessIntervalMs?: number;
};

export type IdentifySessionOptions = {
  settings: IdentifySettings;
  featureTemplates: string[];
  onTracking: (boxes: FaceBox[], frame: { w: number; h: number }) => void;
  onMatch: (personIndex: number, score: number) => void;
};

export class IdentifySession {
  readonly settings: IdentifySettings;
  readonly featureTemplates: string[];
  readonly onTracking: IdentifySessionOptions['onTracking'];
  readonly onMatch: IdentifySessionOptions['onMatch'];

  lastLiveness: FaceBox[] = [];
  frameSize = { w: 480, h: 640 };
  lastUri: string | null = null;

  private camera: Camera | null = null;
  private unsubscribe: (() => void) | null = null;
  private cancelled = false;
  private workerReady = false;
  private snapBusy = false;
  private livBusy = false;
  private lastLivenessMs = 0;
  private pollPromise: Promise<void> | null = null;

  constructor(opts: IdentifySessionOptions) {
    this.settings = opts.settings;
    this.featureTemplates = opts.featureTemplates;
    this.onTracking = opts.onTracking;
    this.onMatch = opts.onMatch;
  }

  /** Engine frames stay unmirrored. iOS front preview is mirrored → flip overlay X. */
  get overlayMirror(): boolean {
    return this.settings.frontCamera && Platform.OS === 'ios';
  }

  attach(camera: Camera): void {
    this.camera = camera;
  }

  async start(): Promise<void> {
    this.cancelled = false;
    this.unsubscribe = subscribeVideoWorker((ev) => {
      if (this.cancelled) return;
      if (ev.type === 'tracking') {
        if (this.frameSize.w <= 0 && ev.frameWidth > 0 && ev.frameHeight > 0) {
          this.frameSize = { w: ev.frameWidth, h: ev.frameHeight };
        }
        let next = ev.faces.map(workerFaceToBox);
        next = mergeLiveness(next, this.lastLiveness);
        this.onTracking(next, this.frameSize);
        for (const f of ev.faces) {
          if (f.match?.matched && f.match.personIndex != null) {
            this.onMatch(f.match.personIndex, f.match.score ?? 0);
            break;
          }
        }
      } else if (ev.type === 'match' && ev.matched && ev.personIndex != null) {
        this.onMatch(ev.personIndex, ev.score ?? 0);
      }
    });

    const started = await startVideoWorker({
      matchThreshold: this.settings.matchThreshold,
    });
    const synced = await syncVideoWorkerDatabase(
      this.featureTemplates,
      this.settings.matchThreshold
    );
    if (!this.cancelled) {
      this.workerReady = started === 0 && synced === 0;
    }
    this.pollPromise = this.pollLoop();
  }

  leave(): void {
    this.cancelled = true;
    this.workerReady = false;
  }

  async stop(): Promise<void> {
    this.leave();
    this.unsubscribe?.();
    this.unsubscribe = null;
    await this.pollPromise;
    this.pollPromise = null;
    await stopVideoWorker();
  }

  async dispose(): Promise<void> {
    await this.stop();
  }

  private async pollLoop(): Promise<void> {
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));
    const interval = this.settings.frameIntervalMs ?? 100;
    while (!this.cancelled) {
      if (!this.workerReady || this.snapBusy || !this.camera) {
        await sleep(80);
        continue;
      }
      this.snapBusy = true;
      try {
        const photo = await this.camera.takeSnapshot({ quality: 85 });
        const live = await ingestLiveCameraFrame(photo, {
          frontCamera: this.settings.frontCamera,
        });
        if (!live.ingested) {
          await sleep(100);
          continue;
        }
        if (live.width > 0 && live.height > 0) {
          this.frameSize = { w: live.width, h: live.height };
        }
        const now = Date.now();
        const livInterval = this.settings.livenessIntervalMs ?? 450;
        if (
          !this.cancelled &&
          !this.livBusy &&
          now - this.lastLivenessMs >= livInterval
        ) {
          this.lastLivenessMs = now;
          this.livBusy = true;
          try {
            const exported = await exportLastLiveFrame();
            if (exported.uri && !this.cancelled) {
              this.lastUri = exported.uri;
              const liv = await faceDetection(exported.uri, {
                check_liveness: true,
                check_liveness_level: this.settings.livenessLevel,
              });
              if (liv.length > 0) this.lastLiveness = liv;
            }
          } catch {
            // FaceBox.liveness copy is optional while the camera warms up.
          } finally {
            this.livBusy = false;
          }
        } else {
          try {
            const exported = await exportLastLiveFrame();
            if (exported.uri) this.lastUri = exported.uri;
          } catch {
            // export optional
          }
        }
      } catch {
        // Snapshot can fail while camera warms up.
      } finally {
        this.snapBusy = false;
      }
      await sleep(interval);
    }
  }
}
