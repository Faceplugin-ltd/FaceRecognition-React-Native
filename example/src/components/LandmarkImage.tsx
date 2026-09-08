import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type Point = { x: number; y: number };

type Props = {
  uri: string | null;
  /** Landmark coords in cropFace bitmap pixels (typically 200×200). */
  landmarks: Point[];
  /** Crop bitmap pixel size used when mapping landmarks (default 200×200). */
  imageSize?: { w: number; h: number };
  width: number;
  height: number;
  style?: object;
};

/** Android LandmarkImageView — face crop with numbered landmark dots. */
export default function LandmarkImage({
  uri,
  landmarks,
  imageSize: imageSizeProp,
  width,
  height,
  style,
}: Props) {
  const [measured, setMeasured] = useState<{ w: number; h: number } | null>(
    null
  );

  useEffect(() => {
    setMeasured(null);
    if (!uri || imageSizeProp) return;
    Image.getSize(
      uri,
      (w, h) => {
        if (w > 0 && h > 0) setMeasured({ w, h });
      },
      () => undefined
    );
  }, [uri, imageSizeProp]);

  const imageSize = imageSizeProp ?? measured ?? { w: 200, h: 200 };

  const mapped = useMemo(() => {
    if (!landmarks.length || imageSize.w <= 0 || imageSize.h <= 0) return [];
    const scale = Math.min(width / imageSize.w, height / imageSize.h);
    const dx = (width - imageSize.w * scale) / 2;
    const dy = (height - imageSize.h * scale) / 2;
    return landmarks.map((p) => ({
      x: p.x * scale + dx,
      y: p.y * scale + dy,
    }));
  }, [landmarks, imageSize, width, height]);

  return (
    <View style={[{ width, height }, styles.wrap, style]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      ) : null}
      {mapped.map((pt, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[styles.dot, { left: pt.x - 4, top: pt.y - 4 }]}
        >
          <Text style={styles.dotLabel}>{i + 1}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: '#303033',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E5FF',
    alignItems: 'center',
  },
  dotLabel: {
    position: 'absolute',
    top: -12,
    width: 20,
    left: -6,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
