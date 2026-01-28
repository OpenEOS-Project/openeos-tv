import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { TVText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { TV_SIZES } from '@/constants';

interface QRCodeDisplayProps {
  url: string;
  verificationCode: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  verificationCode,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.qrContainer,
          {
            backgroundColor: '#FFFFFF',
            borderColor: colors.border,
          },
        ]}>
        <QRCode
          value={url}
          size={300}
          backgroundColor="#FFFFFF"
          color="#000000"
        />
      </View>
      <View style={styles.codeContainer}>
        <TVText variant="caption" color="muted" center>
          Oder Code eingeben:
        </TVText>
        <View
          style={[
            styles.codeBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <TVText variant="h2" bold center>
            {verificationCode}
          </TVText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: TV_SIZES.spacingXl,
  },
  qrContainer: {
    padding: TV_SIZES.spacingLg,
    borderRadius: TV_SIZES.radiusLg,
    borderWidth: 2,
  },
  codeContainer: {
    alignItems: 'center',
    gap: TV_SIZES.spacingSm,
  },
  codeBox: {
    paddingHorizontal: TV_SIZES.spacingXl,
    paddingVertical: TV_SIZES.spacingMd,
    borderRadius: TV_SIZES.radiusMd,
    borderWidth: 2,
    minWidth: 300,
  },
});
