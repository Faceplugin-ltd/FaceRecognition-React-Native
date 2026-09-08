import { parseVideoWorkerEvent, workerFaceToBox } from '../capture/videoWorker';

describe('parseVideoWorkerEvent', () => {
  it('parses tracking with face region and pose', () => {
    const ev = parseVideoWorkerEvent(
      JSON.stringify({
        event: 'tracking',
        frame_width: 480,
        frame_height: 640,
        faces: [
          {
            track_id: 3,
            weak: false,
            faceRegion: { x: 10, y: 20, width: 100, height: 120 },
            facePose: { yaw: 1.5, pitch: -2, roll: 0 },
            facePoints: [{ x: 15, y: 25 }],
            match: { matched: true, person_index: 1, score: 0.91 },
          },
        ],
      })
    );
    expect(ev && ev.type).toBe('tracking');
    if (!ev || ev.type !== 'tracking') {
      return;
    }
    expect(ev.frameWidth).toBe(480);
    expect(ev.faces.length).toBe(1);
    const face = ev.faces[0];
    expect(face && face.match && face.match.personIndex).toBe(1);
    if (!face) {
      return;
    }
    const box = workerFaceToBox(face);
    expect(box.x1).toBe(10);
    expect(box.x2).toBe(110);
  });

  it('parses match event', () => {
    const ev = parseVideoWorkerEvent(
      JSON.stringify({
        event: 'match',
        track_id: 7,
        matched: true,
        person_index: 2,
        score: 0.8,
      })
    );
    expect(ev && ev.type).toBe('match');
    if (!ev || ev.type !== 'match') {
      return;
    }
    expect(ev.trackId).toBe(7);
    expect(ev.personIndex).toBe(2);
  });

  it('returns null for junk', () => {
    expect(parseVideoWorkerEvent('not-json')).toBeNull();
    expect(parseVideoWorkerEvent('{"event":"unknown"}')).toBeNull();
  });
});
