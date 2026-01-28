import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { TV_SIZES } from '@/constants';

type TVTextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyLarge' | 'caption' | 'label';
type TVTextColor = 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'inherit';

interface TVTextProps {
  children: React.ReactNode;
  variant?: TVTextVariant;
  color?: TVTextColor;
  style?: TextStyle;
  numberOfLines?: number;
  bold?: boolean;
  center?: boolean;
}

export const TVText: React.FC<TVTextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  style,
  numberOfLines,
  bold = false,
  center = false,
}) => {
  const { colors } = useTheme();

  const getTextColor = (): string => {
    switch (color) {
      case 'primary':
        return colors.text;
      case 'secondary':
        return colors.textSecondary;
      case 'muted':
        return colors.textMuted;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'inherit':
        return 'inherit';
      default:
        return colors.text;
    }
  };

  const getVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: TV_SIZES.font3xl,
          fontWeight: '700',
          lineHeight: TV_SIZES.font3xl * 1.2,
        };
      case 'h2':
        return {
          fontSize: TV_SIZES.font2xl,
          fontWeight: '700',
          lineHeight: TV_SIZES.font2xl * 1.2,
        };
      case 'h3':
        return {
          fontSize: TV_SIZES.fontXl,
          fontWeight: '600',
          lineHeight: TV_SIZES.fontXl * 1.3,
        };
      case 'bodyLarge':
        return {
          fontSize: TV_SIZES.fontLg,
          fontWeight: '400',
          lineHeight: TV_SIZES.fontLg * 1.5,
        };
      case 'body':
        return {
          fontSize: TV_SIZES.fontMd,
          fontWeight: '400',
          lineHeight: TV_SIZES.fontMd * 1.5,
        };
      case 'caption':
        return {
          fontSize: TV_SIZES.fontSm,
          fontWeight: '400',
          lineHeight: TV_SIZES.fontSm * 1.4,
        };
      case 'label':
        return {
          fontSize: TV_SIZES.fontSm,
          fontWeight: '600',
          lineHeight: TV_SIZES.fontSm * 1.4,
          textTransform: 'uppercase',
          letterSpacing: 1,
        };
      default:
        return {
          fontSize: TV_SIZES.fontMd,
          fontWeight: '400',
        };
    }
  };

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        getVariantStyles(),
        {
          color: getTextColor(),
          fontWeight: bold ? '700' : undefined,
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}>
      {children}
    </Text>
  );
};
