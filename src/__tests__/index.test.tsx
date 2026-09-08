import { LIVE_FRAME_MAX_EDGE, planLiveFrame } from '../liveFramePrep';
import { normalizeFaceBox } from '../normalizeFaceBox';

describe('face-recognition-sdk export surface', () => {
  it('exports live-frame and normalize helpers', () => {
    expect(LIVE_FRAME_MAX_EDGE).toBe(640);
    expect(typeof planLiveFrame).toBe('function');
    expect(typeof normalizeFaceBox).toBe('function');
  });
});
