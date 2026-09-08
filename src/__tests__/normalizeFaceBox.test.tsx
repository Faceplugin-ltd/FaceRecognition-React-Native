import { normalizeFaceBox, normalizeFaceBoxes } from '../normalizeFaceBox';

describe('normalizeFaceBox', () => {
  it('is identity when attributes already present (iOS shape)', () => {
    const ios = {
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 120,
      liveness: 0.9,
      livenessLabel: 'Real · 90%',
      glassesLabel: 'No',
      attributes: {
        Liveness2D: 'Real · 90%',
        Glasses: 'No',
        Lighting: 'Good · 80%',
      },
    };
    const out = normalizeFaceBox(ios);
    expect(out).toBe(ios);
    expect(out.attributes?.Lighting).toBe('Good · 80%');
  });

  it('synthesizes attributes from Android typed fields', () => {
    const android = {
      x1: 1,
      y1: 2,
      x2: 3,
      y2: 4,
      age: 30,
      genderLabel: 'Male',
      emotionLabel: 'Neutral',
      maskLabel: 'No Mask',
      liveness: 0.85,
      livenessLabel: 'Real',
      qualityLabel: 'Good',
      face_quality: 0.7,
      eyesLeftLabel: 'Open',
      eyesRightLabel: 'Open',
      face_occlusion: 0.1,
    };
    const out = normalizeFaceBox(android);
    expect(out.attributes).toBeDefined();
    expect(out.attributes?.Gender).toBe('Male');
    expect(out.attributes?.Emotion).toBe('Neutral');
    expect(out.attributes?.MedicalMask).toBe('No Mask');
    expect(out.attributes?.Liveness2D).toBe('Real · 85%');
    expect(out.attributes?.Age).toBe('30');
    expect(out.attributes?.EyesLeft).toBe('Open');
    expect(out.occlusionLabel).toMatch(/Clear/);
    expect(out.attributes?.Occlusion).toMatch(/Clear/);
    // Do not invent glasses when missing
    expect(out.attributes?.Glasses).toBeUndefined();
  });

  it('normalizes arrays', () => {
    const boxes = normalizeFaceBoxes([
      { x1: 0, y1: 0, x2: 1, y2: 1, genderLabel: 'Female' },
      {
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
        attributes: { Gender: 'Male' },
        genderLabel: 'Male',
      },
    ]);
    expect(boxes[0]!.attributes?.Gender).toBe('Female');
    expect(boxes[1]!.attributes?.Gender).toBe('Male');
  });
});
