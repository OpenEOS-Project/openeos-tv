import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import { useTheme } from '@/hooks/useTheme';
import { TV_SIZES } from '@/constants';

interface FocusableButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  focusKey?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const FocusableButton: React.FC<FocusableButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  focusKey,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [disabled, onPress]);

  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: handlePress,
  });

  const getBackgroundColor = (): string => {
    if (disabled) {
      return colors.surfaceVariant;
    }
    if (focused) {
      return variant === 'primary' ? colors.primaryDark : colors.primary;
    }
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surfaceVariant;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) {
      return colors.textMuted;
    }
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return colors.text;
      case 'outline':
      case 'ghost':
        return focused ? colors.primary : colors.text;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = (): string => {
    if (focused) {
      return colors.focusBorder;
    }
    if (variant === 'outline') {
      return colors.border;
    }
    return 'transparent';
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: TV_SIZES.spacingSm,
          paddingVertical: TV_SIZES.spacingXs,
          minHeight: 48,
        };
      case 'lg':
        return {
          paddingHorizontal: TV_SIZES.spacingXl,
          paddingVertical: TV_SIZES.spacingMd,
          minHeight: 80,
        };
      default:
        return {
          paddingHorizontal: TV_SIZES.spacingLg,
          paddingVertical: TV_SIZES.spacingSm,
          minHeight: 64,
        };
    }
  };

  const getTextSizeStyles = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: TV_SIZES.fontSm };
      case 'lg':
        return { fontSize: TV_SIZES.fontLg };
      default:
        return { fontSize: TV_SIZES.fontMd };
    }
  };

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.button,
        getSizeStyles(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: focused ? TV_SIZES.focusBorderWidth : variant === 'outline' ? 2 : 0,
          transform: focused ? [{ scale: 1.05 }] : [{ scale: 1 }],
        },
        style,
      ]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          getTextSizeStyles(),
          { color: getTextColor() },
          textStyle,
        ]}>
        {children}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TV_SIZES.radiusMd,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: TV_SIZES.spacingSm,
  },
});
