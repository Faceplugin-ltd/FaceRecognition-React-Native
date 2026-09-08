import { planLiveFrame, LIVE_FRAME_MAX_EDGE } from '../liveFramePrep';

describe('planLiveFrame', () => {
  it('uses default maxEdge 640', () => {
    const plan = planLiveFrame({
      frontCamera: false,
      width: 480,
      height: 640,
    });
    expect(plan.maxEdge).toBe(LIVE_FRAME_MAX_EDGE);
    expect(plan.rotateDegrees).toBe(0);
  });

  it('back landscape → +90', () => {
    expect(
      planLiveFrame({
        frontCamera: false,
        orientation: 'landscape-left',
        width: 1280,
        height: 720,
      }).rotateDegrees
    ).toBe(90);
  });

  it('front landscape → -90', () => {
    expect(
      planLiveFrame({
        frontCamera: true,
        orientation: 'landscape-right',
        width: 1280,
        height: 720,
      }).rotateDegrees
    ).toBe(-90);
  });

  it('front portrait → +180 on iOS only', () => {
    expect(
      planLiveFrame({
        frontCamera: true,
        orientation: 'portrait',
        width: 720,
        height: 1280,
        platform: 'ios',
      }).rotateDegrees
    ).toBe(180);
  });

  it('front portrait → 0 on Android (already upright after EXIF)', () => {
    expect(
      planLiveFrame({
        frontCamera: true,
        orientation: 'portrait',
        width: 720,
        height: 1280,
        platform: 'android',
      }).rotateDegrees
    ).toBe(0);
  });

  it('front portrait defaults to +180 when platform omitted (iOS-safe)', () => {
    expect(
      planLiveFrame({
        frontCamera: true,
        orientation: 'portrait',
        width: 720,
        height: 1280,
      }).rotateDegrees
    ).toBe(180);
  });

  it('back portrait → 0', () => {
    expect(
      planLiveFrame({
        frontCamera: false,
        orientation: 'portrait',
        width: 720,
        height: 1280,
        platform: 'android',
      }).rotateDegrees
    ).toBe(0);
  });

  it('square treated as portrait path', () => {
    expect(
      planLiveFrame({
        frontCamera: true,
        width: 640,
        height: 640,
        platform: 'ios',
      }).rotateDegrees
    ).toBe(180);
    expect(
      planLiveFrame({
        frontCamera: true,
        width: 640,
        height: 640,
        platform: 'android',
      }).rotateDegrees
    ).toBe(0);
    expect(
      planLiveFrame({
        frontCamera: false,
        width: 640,
        height: 640,
      }).rotateDegrees
    ).toBe(0);
  });

  it('respects custom maxEdge', () => {
    expect(
      planLiveFrame({
        frontCamera: false,
        width: 100,
        height: 100,
        maxEdge: 320,
      }).maxEdge
    ).toBe(320);
  });

  it('orientation tag alone does not change degrees when size is portrait', () => {
    const a = planLiveFrame({
      frontCamera: true,
      orientation: 'landscape-left',
      width: 480,
      height: 640,
      platform: 'ios',
    });
    const b = planLiveFrame({
      frontCamera: true,
      orientation: 'portrait',
      width: 480,
      height: 640,
      platform: 'ios',
    });
    expect(a.rotateDegrees).toBe(180);
    expect(b.rotateDegrees).toBe(180);
  });
});
