import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import type { FaceBox } from 'face-recognition-sdk';
import { hasLiveness, mapFramePoint } from 'face-recognition-sdk/capture';
import { livenessPassed, type AppSettings } from '../FaceDatabase';

type Props = {
  width: number;
  height: number;
  frameW: number;
  frameH: number;
  mirror: boolean;
  /** When the whole overlay is inside a CSS scaleX(-1) preview, un-flip label glyphs. */
  invertLabelText?: boolean;
  boxes: FaceBox[];
  settings: AppSettings;
};

/** Android FaceView overlay — cyan track / green REAL / red SPOOF + landmarks. */
export default function FaceOverlay({
  width,
  height,
  frameW,
  frameH,
  mirror,
  invertLabelText = false,
  boxes,
  settings,
}: Props) {
  if (frameW <= 0 || frameH <= 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {boxes.map((box, idx) => {
          const p1 = mapFramePoint(
            box.x1,
            box.y1,
            frameW,
            frameH,
            width,
            height,
            mirror
          );
          const p2 = mapFramePoint(
            box.x2,
            box.y2,
            frameW,
            frameH,
            width,
            height,
            mirror
          );
          const left = Math.min(p1.x, p2.x);
          const right = Math.max(p1.x, p2.x);
          const top = Math.min(p1.y, p2.y);
          const bottom = Math.max(p1.y, p2.y);
          const known = hasLiveness(box);
          const live =
            known &&
            livenessPassed(settings, box.liveness ?? 0, box.livenessLabel);
          const color = !known ? '#00FFFF' : live ? '#00FF00' : '#FF0000';
          const lm = box.landmarks ?? [];
          const n = Math.max(
            0,
            Math.min(
              box.landmarkCount ?? lm.length / 2,
              Math.floor(lm.length / 2)
            )
          );
          return (
            <React.Fragment key={idx}>
              <Rect
                x={left}
                y={top}
                width={right - left}
                height={bottom - top}
                stroke={color}
                strokeWidth={5}
                fill="transparent"
              />
              {Array.from({ length: n }).map((_, i) => {
                const pt = mapFramePoint(
                  lm[i * 2] ?? 0,
                  lm[i * 2 + 1] ?? 0,
                  frameW,
                  frameH,
                  width,
                  height,
                  mirror
                );
                return (
                  <Circle key={`lm-${i}`} cx={pt.x} cy={pt.y} r={5} fill={color} />
                );
              })}
            </React.Fragment>
          );
        })}
      </Svg>
      {boxes.map((box, idx) => {
        const p1 = mapFramePoint(
          box.x1,
          box.y1,
          frameW,
          frameH,
          width,
          height,
          mirror
        );
        const p2 = mapFramePoint(
          box.x2,
          box.y2,
          frameW,
          frameH,
          width,
          height,
          mirror
        );
        const left = Math.min(p1.x, p2.x);
        const top = Math.min(p1.y, p2.y);
        const known = hasLiveness(box);
        if (!known) return null;
        const live = livenessPassed(
          settings,
          box.liveness ?? 0,
          box.livenessLabel
        );
        const color = live ? '#00FF00' : '#FF0000';
        const label = live
          ? `REAL ${box.liveness ?? 0}`
          : `SPOOF ${box.liveness ?? 0}`;
        return (
          <Text
            key={`lbl-${idx}`}
            style={[
              styles.label,
              { left: left + 10, top: top - 28, color },
              invertLabelText ? styles.labelUnmirror : null,
            ]}
          >
            {label}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '700',
  },
  labelUnmirror: {
    transform: [{ scaleX: -1 }],
  },
});
