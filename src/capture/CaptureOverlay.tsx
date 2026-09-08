import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Mask,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import type { FaceBox } from '../index';
import { mapRoiToView, type FrameSize } from './captureLogic';

export type CaptureViewMode =
  | 'NO_FACE_PREPARE'
  | 'REPEAT_NO_FACE_PREPARE'
  | 'TO_FACE_CIRCLE'
  | 'FACE_CIRCLE_TO_NO_FACE'
  | 'FACE_CIRCLE'
  | 'FACE_CAPTURE_PREPARE'
  | 'FACE_CAPTURE_DONE';

type Props = {
  width: number;
  height: number;
  frame: FrameSize;
  /** True when preview is visually mirrored (front) but engine frames are not. */
  mirror: boolean;
  viewMode: CaptureViewMode;
  faceBox: FaceBox | null;
  capturedUri: string | null;
  onModeFinished?: (mode: CaptureViewMode) => void;
};

const ON_PRIMARY = '#EADDFF';
const ON_SURFACE = '#E6E1E5';
const ON_TERTIARY = '#492532';

/** Android CaptureView — oval guide, tick marks, pose guides, capture animations. */
export default function CaptureOverlay({
  width,
  height,
  frame,
  mirror,
  viewMode,
  faceBox,
  capturedUri,
  onModeFinished,
}: Props) {
  const anim = useRef(new Animated.Value(1.4)).current;
  const modeRef = useRef(viewMode);
  const onFinishedRef = useRef(onModeFinished);
  modeRef.current = viewMode;
  onFinishedRef.current = onModeFinished;

  useEffect(() => {
    anim.stopAnimation();
    let animation: Animated.CompositeAnimation | null = null;
    const finish = () => onFinishedRef.current?.(modeRef.current);

    if (viewMode === 'NO_FACE_PREPARE') {
      anim.setValue(1.4);
      animation = Animated.timing(anim, {
        toValue: 0.88,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      });
      animation.start(({ finished }) => finished && finish());
    } else if (viewMode === 'REPEAT_NO_FACE_PREPARE') {
      anim.setValue(0.88);
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.92,
            duration: 1300,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.88,
            duration: 1300,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
    } else if (viewMode === 'TO_FACE_CIRCLE') {
      anim.setValue(1.4);
      animation = Animated.timing(anim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      });
      animation.start(({ finished }) => finished && finish());
    } else if (viewMode === 'FACE_CIRCLE_TO_NO_FACE') {
      anim.setValue(0);
      animation = Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      });
      animation.start(({ finished }) => finished && finish());
    } else if (viewMode === 'FACE_CAPTURE_PREPARE') {
      anim.setValue(0);
      animation = Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      });
      animation.start(({ finished }) => finished && finish());
    } else if (viewMode === 'FACE_CAPTURE_DONE') {
      anim.setValue(0);
      animation = Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      });
      animation.start(({ finished }) => finished && finish());
    } else if (viewMode === 'FACE_CIRCLE') {
      anim.setValue(0);
    }

    return () => {
      animation?.stop();
    };
    // Intentionally only restart when viewMode changes — not when callback identity changes.
  }, [viewMode, anim]);

  const safeFrame =
    frame.w > 0 && frame.h > 0 ? frame : { w: 720, h: 1280 };
  const roi = useMemo(
    () => mapRoiToView(safeFrame, width, height),
    [safeFrame.w, safeFrame.h, width, height]
  );

  const [scale, setScale] = React.useState(1.4);
  useEffect(() => {
    const id = anim.addListener(({ value }) => setScale(value));
    return () => anim.removeListener(id);
  }, [anim]);

  const showCorners =
    viewMode === 'NO_FACE_PREPARE' ||
    viewMode === 'REPEAT_NO_FACE_PREPARE' ||
    viewMode === 'TO_FACE_CIRCLE' ||
    viewMode === 'FACE_CIRCLE_TO_NO_FACE';

  const showCircle =
    viewMode === 'FACE_CIRCLE' ||
    viewMode === 'FACE_CAPTURE_PREPARE' ||
    viewMode === 'FACE_CAPTURE_DONE' ||
    (viewMode === 'TO_FACE_CIRCLE' && scale < 1) ||
    viewMode === 'FACE_CIRCLE_TO_NO_FACE';

  const cornerScale =
    viewMode === 'NO_FACE_PREPARE' ||
    viewMode === 'REPEAT_NO_FACE_PREPARE' ||
    (viewMode === 'TO_FACE_CIRCLE' && scale > 1)
      ? scale
      : 1;

  const cx = roi.centerX;
  const cy = roi.centerY;
  const rw = Math.max(1, roi.width * cornerScale);
  const rh = Math.max(1, roi.height * cornerScale);
  const left = cx - rw / 2;
  const top = cy - rh / 2;
  const right = cx + rw / 2;
  const bottom = cy + rh / 2;

  let lineWidth = rw / 5;
  let lineHeight = rh / 5;
  let lineWidthOffset = 0;
  let lineHeightOffset = 0;
  let quadR = Math.max(8, rw / 12);
  if (
    viewMode === 'FACE_CIRCLE' ||
    (viewMode === 'TO_FACE_CIRCLE' && scale < 1) ||
    viewMode === 'FACE_CIRCLE_TO_NO_FACE'
  ) {
    const t = Math.max(0, Math.min(1, scale));
    lineWidth = lineWidth * t;
    lineHeight = lineHeight * t;
    lineWidthOffset = (rw / 2) * (1 - t);
    lineHeightOffset = (rh / 2) * (1 - t);
    quadR = Math.max(8, rw / 12 + (rw / 2 - rw / 12) * (1 - t) - 20);
  }

  const cornerAlpha =
    viewMode === 'NO_FACE_PREPARE' ||
    (viewMode === 'TO_FACE_CIRCLE' && scale > 1)
      ? Math.min(1, Math.max(0, (1.4 - scale) / 0.4))
      : 1;

  const ticks = useMemo(() => {
    if (viewMode !== 'FACE_CIRCLE') return null;
    const items: React.ReactNode[] = [];
    const a1 = roi.width / 2 + 10;
    const b1 = roi.height / 2 + 10;
    const a2 = roi.width / 2 + 40;
    const b2 = roi.height / 2 + 40;
    for (let i = 0; i < 360; i += 5) {
      const th = (i * Math.PI) / 180;
      const tan = Math.tan(th);
      const den1 = Math.sqrt(b1 * b1 + a1 * a1 * tan * tan);
      const den2 = Math.sqrt(b2 * b2 + a2 * a2 * tan * tan);
      if (!Number.isFinite(den1) || !Number.isFinite(den2) || den1 === 0 || den2 === 0) {
        continue;
      }
      let x1 = (a1 * b1) / den1;
      let x2 = (a2 * b2) / den2;
      const ratio = 1 - (x1 / a1) * (x1 / a1);
      if (ratio < 0 || !Number.isFinite(ratio)) continue;
      let y1 = Math.sqrt(ratio) * b1;
      let y2 = Math.sqrt(ratio) * b2;
      if (i % 360 > 90 && i % 360 < 270) {
        x1 = -x1;
        x2 = -x2;
      }
      if (i % 360 > 180 && i % 360 < 360) {
        y1 = -y1;
        y2 = -y2;
      }
      if (![x1, y1, x2, y2].every(Number.isFinite)) continue;
      items.push(
        <Line
          key={i}
          x1={cx + x1}
          y1={cy - y1}
          x2={cx + x2}
          y2={cy - y2}
          stroke={ON_SURFACE}
          strokeWidth={8}
        />
      );
    }
    return items;
  }, [viewMode, roi.width, roi.height, cx, cy]);

  // Preview is flipped for front (CSS), engine yaw is unmirrored — match Android CaptureView.
  const yaw = faceBox
    ? mirror
      ? faceBox.yaw ?? 0
      : -(faceBox.yaw ?? 0)
    : 0;
  const pitch = faceBox ? -(faceBox.pitch ?? 0) : 0;

  const prepareScale =
    viewMode === 'FACE_CAPTURE_PREPARE' ? Math.max(0.01, 1 - scale) : 1;
  const doneLift =
    viewMode === 'FACE_CAPTURE_DONE'
      ? (width / 5 - roi.top) * scale
      : 0;
  const doneCircleScale = viewMode === 'FACE_CAPTURE_DONE' ? 0.8 : 1;

  const scrimAlpha =
    viewMode === 'FACE_CIRCLE_TO_NO_FACE' ? 1 - scale : showCircle ? 1 : 0;

  const holeRadius = (() => {
    if (viewMode === 'FACE_CAPTURE_PREPARE') {
      return (roi.width / 2) * prepareScale;
    }
    if (
      viewMode === 'TO_FACE_CIRCLE' ||
      viewMode === 'FACE_CIRCLE_TO_NO_FACE'
    ) {
      const start = (0.8 * roi.width * 0.5) / Math.cos((45 * Math.PI) / 180);
      return (roi.width / 2) * (1 - scale) + start * scale;
    }
    return roi.width / 2;
  })();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="scrim" x1="0" y1="0" x2={width} y2={height}>
            <Stop offset="0" stopColor="#1C1B1F" stopOpacity={scrimAlpha} />
            <Stop offset="1" stopColor="#000000" stopOpacity={scrimAlpha} />
          </LinearGradient>
          <Mask id="hole">
            <Rect x={0} y={0} width={width} height={height} fill="#fff" />
            {showCircle && viewMode !== 'FACE_CAPTURE_DONE' ? (
              <Circle
                cx={cx}
                cy={cy}
                r={Math.max(1, holeRadius)}
                fill="#000"
              />
            ) : null}
          </Mask>
        </Defs>

        {showCircle ? (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="url(#scrim)"
            mask="url(#hole)"
          />
        ) : null}

        {showCorners ? (
          <>
            <Path
              d={`M ${left} ${top + lineHeight + lineHeightOffset}
                  L ${left} ${top + quadR}
                  A ${quadR} ${quadR} 0 0 1 ${left + quadR} ${top}
                  L ${left + lineWidth + lineWidthOffset} ${top}`}
              stroke={ON_PRIMARY}
              strokeWidth={10}
              fill="none"
              strokeOpacity={cornerAlpha}
            />
            <Path
              d={`M ${right} ${top + lineHeight + lineHeightOffset}
                  L ${right} ${top + quadR}
                  A ${quadR} ${quadR} 0 0 0 ${right - quadR} ${top}
                  L ${right - lineWidth - lineWidthOffset} ${top}`}
              stroke={ON_PRIMARY}
              strokeWidth={10}
              fill="none"
              strokeOpacity={cornerAlpha}
            />
            <Path
              d={`M ${right} ${bottom - lineHeight - lineHeightOffset}
                  L ${right} ${bottom - quadR}
                  A ${quadR} ${quadR} 0 0 1 ${right - quadR} ${bottom}
                  L ${right - lineWidth - lineWidthOffset} ${bottom}`}
              stroke={ON_PRIMARY}
              strokeWidth={10}
              fill="none"
              strokeOpacity={cornerAlpha}
            />
            <Path
              d={`M ${left} ${bottom - lineHeight - lineHeightOffset}
                  L ${left} ${bottom - quadR}
                  A ${quadR} ${quadR} 0 0 0 ${left + quadR} ${bottom}
                  L ${left + lineWidth + lineWidthOffset} ${bottom}`}
              stroke={ON_PRIMARY}
              strokeWidth={10}
              fill="none"
              strokeOpacity={cornerAlpha}
            />
          </>
        ) : null}

        {viewMode === 'FACE_CIRCLE' ? ticks : null}

        {viewMode === 'FACE_CIRCLE' && faceBox ? (
          <>
            <Path
              d={`M ${cx} ${roi.top}
                  Q ${cx - roi.width * Math.sin((yaw * Math.PI) / 180)} ${cy} ${cx} ${roi.bottom}
                  Q ${cx - (roi.width * Math.sin((yaw * Math.PI) / 180)) / 3} ${cy} ${cx} ${roi.top}`}
              fill={ON_PRIMARY}
              fillOpacity={0.5}
            />
            <Path
              d={`M ${roi.left} ${cy}
                  Q ${cx} ${cy + roi.width * Math.sin((pitch * Math.PI) / 180)} ${roi.right} ${cy}
                  Q ${cx} ${cy + (roi.width * Math.sin((pitch * Math.PI) / 180)) / 3} ${roi.left} ${cy}`}
              fill={ON_PRIMARY}
              fillOpacity={0.5}
            />
          </>
        ) : null}

        {viewMode === 'FACE_CAPTURE_PREPARE' ? (
          <Circle
            cx={cx}
            cy={cy}
            r={(roi.width / 2) * 1.04}
            fill={ON_TERTIARY}
          />
        ) : null}
      </Svg>

      {viewMode === 'FACE_CAPTURE_DONE' && capturedUri ? (
        <View
          style={[
            styles.doneCircle,
            {
              width: roi.width * doneCircleScale,
              height: roi.height * doneCircleScale,
              left: cx - (roi.width * doneCircleScale) / 2,
              top: cy - (roi.height * doneCircleScale) / 2 + doneLift,
              borderRadius: (roi.width * doneCircleScale) / 2,
              borderColor: ON_TERTIARY,
            },
          ]}
        >
          <Animated.Image
            source={{ uri: capturedUri }}
            style={[
              styles.doneImage,
              // Only flip when showing front-camera capture (unmirrored engine bitmap).
              mirror ? { transform: [{ scaleX: -1 }] } : null,
            ]}
            resizeMode="cover"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  doneCircle: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 8,
    backgroundColor: '#000',
  },
  doneImage: {
    width: '100%',
    height: '100%',
  },
});
