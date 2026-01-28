import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  useFocusable,
  FocusContext,
} from '@noriginmedia/norigin-spatial-navigation';
import { Header } from '@/components/common';
import { FocusableCard, FocusableButton, TVText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useDisplaySocket } from '@/hooks/useDisplaySocket';
import { useDeviceStore, useDisplayStore } from '@/stores';
import { displayApi } from '@/lib/api-client';
import { TV_SIZES, DISPLAY_REFRESH_INTERVAL, PRIORITY_COLORS } from '@/constants';
import type { Order, OrderItem } from '@/types';

export const KitchenScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { selectedEventId } = useDeviceStore();
  const { orders, setOrders } = useDisplayStore();

  const { ref: containerRef, focusKey } = useFocusable({
    focusable: false,
    saveLastFocusedChild: true,
    trackChildren: true,
  });

  // Connect to display socket with event handlers
  const { markItemReady } = useDisplaySocket({
    onNewOrder: order => {
      // Play sound notification if enabled
      console.log('[Kitchen] New order received:', order.orderNumber);
    },
  });

  // Fetch kitchen orders
  const { data: fetchedOrders, refetch } = useQuery({
    queryKey: ['kitchen-orders', selectedEventId],
    queryFn: () => displayApi.getKitchenOrders(selectedEventId || undefined),
    refetchInterval: DISPLAY_REFRESH_INTERVAL,
  });

  // Update store when data changes
  useEffect(() => {
    if (fetchedOrders) {
      setOrders(fetchedOrders);
    }
  }, [fetchedOrders, setOrders]);

  // Calculate wait time
  const getWaitTime = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - created.getTime()) / 60000,
    );

    if (diffMinutes < 1) {
      return t('time.now');
    } else if (diffMinutes < 60) {
      return t('time.minute', { count: diffMinutes });
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return t('time.hour', { count: hours });
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    const priorityConfig = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS];
    return priorityConfig ? priorityConfig[isDark ? 'dark' : 'light'] : colors.text;
  };

  // Handle mark item ready
  const handleMarkReady = useCallback(
    (orderId: string, itemId: string) => {
      markItemReady(orderId, itemId);
    },
    [markItemReady],
  );

  // Handle mark all items ready
  const handleMarkAllReady = useCallback(
    (order: Order) => {
      order.items
        .filter(
          item => item.status === 'pending' || item.status === 'preparing',
        )
        .forEach(item => {
          markItemReady(order.id, item.id);
        });
    },
    [markItemReady],
  );

  // Render order item
  const renderOrderItem = useCallback(
    (item: OrderItem, orderId: string) => (
      <View
        key={item.id}
        style={[
          styles.orderItem,
          {
            backgroundColor:
              item.status === 'ready'
                ? colors.successLight
                : item.status === 'preparing'
                ? colors.warningLight
                : colors.surface,
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.itemInfo}>
          <TVText variant="bodyLarge" bold>
            {item.quantity}x {item.productName}
          </TVText>
          {item.options?.selected && item.options.selected.length > 0 && (
            <TVText variant="caption" color="muted">
              {item.options.selected.map(o => o.optionName).join(', ')}
            </TVText>
          )}
          {item.kitchenNotes && (
            <TVText variant="caption" color="warning">
              {item.kitchenNotes}
            </TVText>
          )}
        </View>
        {item.status !== 'ready' && item.status !== 'delivered' && (
          <FocusableButton
            onPress={() => handleMarkReady(orderId, item.id)}
            variant="primary"
            size="sm"
            focusKey={`item-ready-${item.id}`}>
            {t('kitchen.markReady')}
          </FocusableButton>
        )}
        {item.status === 'ready' && (
          <TVText variant="label" color="success">
            {t('kitchen.itemStatus.ready')}
          </TVText>
        )}
      </View>
    ),
    [colors, t, handleMarkReady],
  );

  // Render order card
  const renderOrder = useCallback(
    ({ item: order }: { item: Order }) => {
      const pendingItems = order.items.filter(
        i => i.status === 'pending' || i.status === 'preparing',
      );
      const hasPendingItems = pendingItems.length > 0;

      return (
        <FocusableCard
          focusKey={`order-${order.id}`}
          style={[
            styles.orderCard,
            {
              borderLeftColor: getPriorityColor(order.priority),
              borderLeftWidth: 6,
            },
          ]}>
          <View style={styles.orderHeader}>
            <View>
              <TVText variant="h3" bold>
                #{order.dailyNumber}
              </TVText>
              {order.tableNumber && (
                <TVText variant="caption" color="secondary">
                  {t('kitchen.tableNumber', { number: order.tableNumber })}
                </TVText>
              )}
            </View>
            <View style={styles.orderMeta}>
              <TVText
                variant="label"
                style={{ color: getPriorityColor(order.priority) }}>
                {t(`kitchen.priority.${order.priority}`)}
              </TVText>
              <TVText variant="caption" color="muted">
                {t('kitchen.waiting', { time: getWaitTime(order.createdAt) })}
              </TVText>
            </View>
          </View>

          <View style={styles.itemsList}>
            {order.items
              .filter(item => item.status !== 'delivered')
              .map(item => renderOrderItem(item, order.id))}
          </View>

          {hasPendingItems && (
            <View style={styles.orderFooter}>
              <FocusableButton
                onPress={() => handleMarkAllReady(order)}
                variant="secondary"
                size="sm"
                focusKey={`order-all-ready-${order.id}`}>
                {t('kitchen.allReady')}
              </FocusableButton>
            </View>
          )}
        </FocusableCard>
      );
    },
    [colors, t, renderOrderItem, handleMarkAllReady, getPriorityColor, getWaitTime],
  );

  return (
    <FocusContext.Provider value={focusKey}>
      <View
        ref={containerRef}
        style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title={t('kitchen.title')}
          subtitle={t('kitchen.newOrders') + ` (${orders.length})`}
        />

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <TVText variant="h3" color="muted" center>
              {t('kitchen.noOrders')}
            </TVText>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrder}
            keyExtractor={order => order.id}
            horizontal
            contentContainerStyle={styles.listContainer}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    </FocusContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: TV_SIZES.spacingMd,
    gap: TV_SIZES.gridGap,
  },
  orderCard: {
    width: 400,
    padding: 0,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: TV_SIZES.spacingMd,
    borderBottomWidth: 1,
  },
  orderMeta: {
    alignItems: 'flex-end',
    gap: TV_SIZES.spacingXs,
  },
  itemsList: {
    padding: TV_SIZES.spacingSm,
    gap: TV_SIZES.spacingXs,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: TV_SIZES.spacingSm,
    borderRadius: TV_SIZES.radiusSm,
    borderWidth: 1,
  },
  itemInfo: {
    flex: 1,
    marginRight: TV_SIZES.spacingSm,
  },
  orderFooter: {
    padding: TV_SIZES.spacingMd,
    borderTopWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
