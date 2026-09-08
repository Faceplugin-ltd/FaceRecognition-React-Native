/** Parsed FaceRecognitionSDK.getLicenseStatus JSON — same contract as native LicenseStatus. */

export type LicenseStatus = {
  licensed: boolean;
  level: number;
  levelName: string;
  recognition: boolean;
  liveness: boolean;
  label: string;
};

export const NOT_LICENSED: LicenseStatus = {
  licensed: false,
  level: -1,
  levelName: 'None',
  recognition: false,
  liveness: false,
  label: 'Not licensed',
};

export function parseLicenseStatus(json?: string | null): LicenseStatus {
  try {
    const o = JSON.parse(json || '{}') as Record<string, unknown>;
    if (!o || typeof o !== 'object' || Array.isArray(o)) return NOT_LICENSED;
    const label =
      typeof o.label === 'string' && o.label.trim() ? o.label : 'Not licensed';
    return {
      licensed: Boolean(o.licensed),
      level: typeof o.level === 'number' ? o.level : -1,
      levelName: typeof o.levelName === 'string' ? o.levelName : 'None',
      recognition: Boolean(o.recognition),
      liveness: Boolean(o.liveness),
      label,
    };
  } catch {
    return NOT_LICENSED;
  }
}

/** Home status bar after a successful init — Android `Ready · %s`. */
export function readyStatusMessage(label: string): string {
  const t = (label || '').trim();
  return t ? `Ready · ${t}` : 'Ready';
}
