import { checkFace, warningFor } from '../capture/captureLogic';
import { DEFAULT_CAPTURE_SETTINGS } from '../capture/types';
import type { FaceBox } from '../index';

const frame = { w: 720, h: 1280 };

describe('checkFace', () => {
  it('no face', () => {
    expect(checkFace([], DEFAULT_CAPTURE_SETTINGS, frame)).toBe('NO_FACE');
  });

  it('multiple faces', () => {
    const a = { x1: 0, y1: 0, x2: 10, y2: 10 } as FaceBox;
    const b = { x1: 20, y1: 20, x2: 30, y2: 30 } as FaceBox;
    expect(checkFace([a, b], DEFAULT_CAPTURE_SETTINGS, frame)).toBe(
      'MULTIPLE_FACES'
    );
  });

  it('small face → move closer', () => {
    const tiny = { x1: 350, y1: 600, x2: 370, y2: 620 } as FaceBox;
    expect(checkFace([tiny], DEFAULT_CAPTURE_SETTINGS, frame)).toBe(
      'MOVE_CLOSER'
    );
  });

  it('yaw over threshold → no front', () => {
    const turned = {
      x1: 200,
      y1: 420,
      x2: 520,
      y2: 860,
      yaw: 50,
    } as FaceBox;
    expect(checkFace([turned], DEFAULT_CAPTURE_SETTINGS, frame)).toBe(
      'NO_FRONT'
    );
  });
});

describe('warningFor', () => {
  it('maps states', () => {
    expect(warningFor('MULTIPLE_FACES')).toMatch(/Multiple/);
    expect(warningFor('CAPTURE_OK')).toBe('');
  });
});
