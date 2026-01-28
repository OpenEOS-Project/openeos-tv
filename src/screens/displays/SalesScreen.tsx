import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/common';
import { TVText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useDisplaySocket } from '@/hooks/useDisplaySocket';
import { useDeviceStore, useDisplayStore } from '@/stores';
import { displayApi } from '@/lib/api-client';
import { TV_SIZES, STATS_REFRESH_INTERVAL } from '@/constants';
import type { DailyStats } from '@/types';

export const SalesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { selectedEventId } = useDeviceStore();
  const { dailyStats, setDailyStats } = useDisplayStore();

  // Connect to display socket
  useDisplaySocket();

  // Fetch daily stats
  const { data: fetchedStats } = useQuery({
    queryKey: ['daily-stats', selectedEventId],
    queryFn: () => displayApi.getDailyStats(selectedEventId || undefined),
    refetchInterval: STATS_REFRESH_INTERVAL,
  });

  // Update store when data changes
  useEffect(() => {
    if (fetchedStats) {
      setDailyStats(fetchedStats);
    }
  }, [fetchedStats, setDailyStats]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (!dailyStats) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title={t('sales.title')} />
        <View style={styles.emptyContainer}>
          <TVText variant="h3" color="muted" center>
            {t('sales.noData')}
          </TVText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('sales.title')} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Stats Row */}
        <View style={styles.mainStats}>
          <View
            style={[
              styles.mainStatCard,
              { backgroundColor: colors.primary },
            ]}>
            <TVText variant="label" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {t('sales.totalRevenue')}
            </TVText>
            <TVText variant="h1" bold style={{ color: '#FFFFFF' }}>
              {formatCurrency(dailyStats.totalRevenue)}
            </TVText>
          </View>

          <View
            style={[
              styles.mainStatCard,
              { backgroundColor: colors.surfaceVariant },
            ]}>
            <TVText variant="label" color="muted">
              {t('sales.orderCount')}
            </TVText>
            <TVText variant="h1" bold>
              {dailyStats.orderCount}
            </TVText>
          </View>

          <View
            style={[
              styles.mainStatCard,
              { backgroundColor: colors.surfaceVariant },
            ]}>
            <TVText variant="label" color="muted">
              {t('sales.averageOrder')}
            </TVText>
            <TVText variant="h2" bold>
              {formatCurrency(dailyStats.averageOrderValue)}
            </TVText>
          </View>
        </View>

        {/* Secondary Stats */}
        <View style={styles.secondaryStats}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.warningLight },
            ]}>
            <TVText variant="h3" bold style={{ color: colors.warning }}>
              {dailyStats.openOrders}
            </TVText>
            <TVText variant="body" color="muted">
              {t('sales.openOrders')}
            </TVText>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: colors.infoLight }]}>
            <TVText variant="h3" bold style={{ color: colors.info }}>
              {dailyStats.pendingItems}
            </TVText>
            <TVText variant="body" color="muted">
              {t('sales.pendingItems')}
            </TVText>
          </View>
        </View>

        <View style={styles.sections}>
          {/* Top Products */}
          <View
            style={[styles.section, { backgroundColor: colors.surface }]}>
            <TVText variant="h3" bold>
              {t('sales.topProducts')}
            </TVText>
            <View style={styles.productList}>
              {dailyStats.topProducts.slice(0, 5).map((product, index) => (
                <View key={product.productId} style={styles.productRow}>
                  <View style={styles.productRank}>
                    <TVText variant="h3" bold color="muted">
                      {index + 1}
                    </TVText>
                  </View>
                  <View style={styles.productInfo}>
                    <TVText variant="bodyLarge" bold numberOfLines={1}>
                      {product.productName}
                    </TVText>
                    <TVText variant="caption" color="muted">
                      {product.quantity}x verkauft
                    </TVText>
                  </View>
                  <TVText variant="h3" bold style={{ color: colors.primary }}>
                    {formatCurrency(product.revenue)}
                  </TVText>
                </View>
              ))}
            </View>
          </View>

          {/* Payment Methods */}
          <View
            style={[styles.section, { backgroundColor: colors.surface }]}>
            <TVText variant="h3" bold>
              {t('sales.paymentMethods')}
            </TVText>
            <View style={styles.paymentList}>
              {dailyStats.paymentMethods.map(method => (
                <View key={method.method} style={styles.paymentRow}>
                  <View style={styles.paymentInfo}>
                    <TVText variant="bodyLarge" bold>
                      {method.method === 'cash'
                        ? 'Bargeld'
                        : method.method === 'card'
                        ? 'Karte'
                        : method.method}
                    </TVText>
                    <TVText variant="caption" color="muted">
                      {method.count} Zahlungen
                    </TVText>
                  </View>
                  <TVText variant="h3" bold>
                    {formatCurrency(method.total)}
                  </TVText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Hourly Revenue Chart (simple bar representation) */}
        <View
          style={[styles.section, { backgroundColor: colors.surface }]}>
          <TVText variant="h3" bold>
            {t('sales.hourlyRevenue')}
          </TVText>
          <View style={styles.hourlyChart}>
            {dailyStats.hourlyRevenue.map(hourData => {
              const maxRevenue = Math.max(
                ...dailyStats.hourlyRevenue.map(h => h.revenue),
              );
              const barHeight =
                maxRevenue > 0 ? (hourData.revenue / maxRevenue) * 150 : 0;

              return (
                <View key={hourData.hour} style={styles.hourlyBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor:
                          hourData.revenue > 0
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                  />
                  <TVText variant="caption" color="muted">
                    {hourData.hour}:00
                  </TVText>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: TV_SIZES.spacingXl,
    gap: TV_SIZES.spacingLg,
  },
  mainStats: {
    flexDirection: 'row',
    gap: TV_SIZES.gridGap,
  },
  mainStatCard: {
    flex: 1,
    padding: TV_SIZES.spacingXl,
    borderRadius: TV_SIZES.radiusLg,
    alignItems: 'center',
    gap: TV_SIZES.spacingSm,
  },
  secondaryStats: {
    flexDirection: 'row',
    gap: TV_SIZES.gridGap,
  },
  statCard: {
    flex: 1,
    padding: TV_SIZES.spacingLg,
    borderRadius: TV_SIZES.radiusMd,
    alignItems: 'center',
    gap: TV_SIZES.spacingXs,
  },
  sections: {
    flexDirection: 'row',
    gap: TV_SIZES.gridGap,
  },
  section: {
    flex: 1,
    padding: TV_SIZES.spacingLg,
    borderRadius: TV_SIZES.radiusLg,
    gap: TV_SIZES.spacingMd,
  },
  productList: {
    gap: TV_SIZES.spacingSm,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TV_SIZES.spacingMd,
  },
  productRank: {
    width: 40,
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  paymentList: {
    gap: TV_SIZES.spacingSm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  hourlyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    paddingTop: TV_SIZES.spacingMd,
  },
  hourlyBar: {
    alignItems: 'center',
    gap: TV_SIZES.spacingXs,
  },
  bar: {
    width: 40,
    borderRadius: TV_SIZES.radiusSm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
