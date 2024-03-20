import React from 'react';
import {
  View,
  ViewStyle,
  Image,
  ImageStyle,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { icons } from './icons';
import type { IconTypes } from './icons';

export interface IconProps {
  name: IconTypes;
  style?: ImageStyle | ImageStyle[];
  containerStyle?: ViewStyle;
  onPress?: () => void;
}

export function Icon(props: IconProps) {
  const { style: styleOverride, name, containerStyle, onPress } = props;
  const style = { ...styles.container, ...styleOverride };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={containerStyle}>
        <Image style={style} source={icons[name]} />
      </TouchableOpacity>
    );
  } else {
    return (
      <View style={containerStyle}>
        <Image style={style} source={icons[name]} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    resizeMode: 'contain',
  },
});
