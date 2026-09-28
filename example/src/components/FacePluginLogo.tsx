import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

type Props = {
  size?: number;
  style?: ViewStyle;
  onPress?: () => void;
};

export default function FacePluginLogo({ size = 120, style, onPress }: Props) {
  const image = (
    <Image
      source={require('../assets/fp_logo.png')}
      style={{ width: size * 2.2, height: size * 0.44 }}
      resizeMode="contain"
      accessibilityLabel="FacePlugin"
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.wrap, style]}
        accessibilityRole="button"
        accessibilityLabel="FacePlugin"
      >
        {image}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.wrap, style]}>{image}</View>;
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center' },
});
