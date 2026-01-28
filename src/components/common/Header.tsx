import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TVText } from '@/components/ui';
import { Clock } from './Clock';
import { ConnectionStatus } from './ConnectionStatus';
import { useTheme } from '@/hooks/useTheme';
import { useDeviceStore } from '@/stores';
import { TV_SIZES } from '@/constants';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showClock?: boolean;
  showConnection?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showClock = true,
  showConnection = true,
}) => {
  const { colors } = useTheme();
  const organizationName = useDeviceStore(state => state.organizationName);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.left}>
        <TVText variant="h3">{title}</TVText>
        {subtitle && (
          <TVText variant="caption" color="secondary">
            {subtitle}
          </TVText>
        )}
      </View>
      <View style={styles.center}>
        {organizationName && (
          <TVText variant="body" color="muted">
            {organizationName}
          </TVText>
        )}
      </View>
      <View style={styles.right}>
        {showConnection && <ConnectionStatus />}
        {showClock && <Clock showDate />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TV_SIZES.spacingXl,
    paddingVertical: TV_SIZES.spacingMd,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
    gap: TV_SIZES.spacingSm,
  },
});
