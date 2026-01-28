import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  useFocusable,
  FocusContext,
} from '@noriginmedia/norigin-spatial-navigation';
import { FocusableCard, TVText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useDeviceStore, useDisplayStore } from '@/stores';
import { TV_SIZES } from '@/constants';
import type { RootStackParamList, DisplayMode, DisplayModeConfig } from '@/types';
import { DISPLAY_MODES } from '@/types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DisplayModeSelect'
>;

export const DisplayModeSelectScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { updateDeviceClass } = useDeviceStore();
  const { setDisplayMode, displayMode: currentMode } = useDisplayStore();

  const { ref: containerRef, focusKey } = useFocusable({
    focusable: false,
    saveLastFocusedChild: true,
    trackChildren: true,
  });

  const handleSelectMode = useCallback(
    async (mode: DisplayModeConfig) => {
      // Update device class on server
      await updateDeviceClass(mode.deviceClass);

      // Update local display mode
      setDisplayMode(mode.id);

      // Navigate to the appropriate screen
      const screenMap: Record<DisplayMode, keyof RootStackParamList> = {
        menu: 'Menu',
        kitchen: 'Kitchen',
        delivery: 'Delivery',
        pickup: 'Pickup',
        sales: 'Sales',
      };

      navigation.replace(screenMap[mode.id]);
    },
    [updateDeviceClass, setDisplayMode, navigation],
  );

  const renderModeCard = useCallback(
    ({ item, index }: { item: DisplayModeConfig; index: number }) => (
      <FocusableCard
        focusKey={`mode-${item.id}`}
        onPress={() => handleSelectMode(item)}
        selected={currentMode === item.id}
        style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <TVText variant="h2">
              {item.id === 'menu' && '📋'}
              {item.id === 'kitchen' && '👨‍🍳'}
              {item.id === 'delivery' && '🍽️'}
              {item.id === 'pickup' && '📢'}
              {item.id === 'sales' && '📊'}
            </TVText>
          </View>
          <TVText variant="h3" bold>
            {t(item.labelKey)}
          </TVText>
          <TVText variant="body" color="secondary" numberOfLines={2}>
            {t(item.descriptionKey)}
          </TVText>
          {item.isInteractive && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.primaryLight + '30' },
              ]}>
              <TVText variant="caption" style={{ color: colors.primary }}>
                Interaktiv
              </TVText>
            </View>
          )}
        </View>
      </FocusableCard>
    ),
    [t, colors, currentMode, handleSelectMode],
  );

  return (
    <FocusContext.Provider value={focusKey}>
      <View
        ref={containerRef}
        style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TVText variant="h2" center>
            {t('displayModes.title')}
          </TVText>
          <TVText variant="body" color="secondary" center>
            {t('displayModes.subtitle')}
          </TVText>
        </View>

        <FlatList
          data={DISPLAY_MODES}
          renderItem={renderModeCard}
          keyExtractor={item => item.id}
          horizontal
          contentContainerStyle={styles.list}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <TVText variant="caption" color="muted" center>
            {t('navigation.pressSelectToChoose')}
          </TVText>
        </View>
      </View>
    </FocusContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: TV_SIZES.spacingXl,
  },
  header: {
    paddingHorizontal: TV_SIZES.spacingXl,
    marginBottom: TV_SIZES.spacingXl,
    gap: TV_SIZES.spacingSm,
  },
  list: {
    paddingHorizontal: TV_SIZES.spacingXl,
    gap: TV_SIZES.gridGap,
  },
  card: {
    width: 320,
    height: 280,
  },
  cardContent: {
    flex: 1,
    gap: TV_SIZES.spacingSm,
  },
  cardIcon: {
    marginBottom: TV_SIZES.spacingSm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: TV_SIZES.spacingSm,
    paddingVertical: TV_SIZES.spacingXs / 2,
    borderRadius: TV_SIZES.radiusSm,
    marginTop: 'auto',
  },
  footer: {
    marginTop: TV_SIZES.spacingXl,
    paddingHorizontal: TV_SIZES.spacingXl,
  },
});
