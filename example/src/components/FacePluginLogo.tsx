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
      source={require('../assets/ic_faceplugin.png')}
      style={{ width: size, height: size }}
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
