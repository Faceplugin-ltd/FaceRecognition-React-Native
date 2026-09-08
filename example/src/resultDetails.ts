import {
  resultDetailRows as packageRows,
  type DetailRow,
  type FaceBox,
} from 'face-recognition-sdk';
import type { AppSettings } from './FaceDatabase';

export type { DetailRow };

/** Demo wrapper — Settings stay in the app; rows come from the package. */
export function resultDetailRows(
  box: FaceBox,
  settings: AppSettings,
  opts?: {
    personName?: string;
    similarity?: number;
    includeMatch?: boolean;
  }
): DetailRow[] {
  return packageRows(box, settings, opts);
}
