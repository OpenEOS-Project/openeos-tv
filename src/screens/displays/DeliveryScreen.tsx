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
import { TV_SIZES, DISPLAY_REFRESH_INTERVAL } from '@/constants';
import type { Order, OrderItem } from '@/types';

export const DeliveryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { selectedEventId } = useDeviceStore();
  const { readyOrders, setReadyOrders } = useDisplayStore();

  const { ref: containerRef, focusKey } = useFocusable({
    focusable: false,
    saveLastFocusedChild: true,
    trackChildren: true,
  });

  // Connect to display socket
  const { markItemDelivered } = useDisplaySocket({
    onOrderReady: order => {
      console.log('[Delivery] Order ready:', order.orderNumber);
    },
  });

  // Fetch ready orders
  const { data: fetchedOrders } = useQuery({
    queryKey: ['ready-orders', selectedEventId],
    queryFn: () => displayApi.getReadyOrders(selectedEventId || undefined),
    refetchInterval: DISPLAY_REFRESH_INTERVAL,
  });

  // Update store when data changes
  useEffect(() => {
    if (fetchedOrders) {
      setReadyOrders(fetchedOrders);
    }
  }, [fetchedOrders, setReadyOrders]);

  // Calculate time since ready
  const getReadyTime = (readyAt: string): string => {
    const ready = new Date(readyAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - ready.getTime()) / 60000);

    if (diffMinutes < 1) {
      return t('time.now');
    } else if (diffMinutes < 60) {
      return t('time.minute', { count: diffMinutes });
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return t('time.hour', { count: hours });
    }
  };

  // Handle mark item delivered
  const handleMarkDelivered = useCallback(
    (orderId: string, itemId: string) => {
      markItemDelivered(orderId, itemId);
    },
    [markItemDelivered],
  );

  // Handle mark all items delivered
  const handleMarkAllDelivered = useCallback(
    (order: Order) => {
      order.items
        .filter(item => item.status === 'ready')
        .forEach(item => {
          markItemDelivered(order.id, item.id);
        });
    },
    [markItemDelivered],
  );

  // Render order item
  const renderOrderItem = useCallback(
    (item: OrderItem, orderId: string) => {
      if (item.status !== 'ready') return null;

      return (
        <View
          key={item.id}
          style={[
            styles.orderItem,
            {
              backgroundColor: colors.successLight,
              borderColor: colors.success,
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
          </View>
          <FocusableButton
            onPress={() => handleMarkDelivered(orderId, item.id)}
            variant="primary"
            size="sm"
            focusKey={`item-deliver-${item.id}`}>
            {t('delivery.markDelivered')}
          </FocusableButton>
        </View>
      );
    },
    [colors, t, handleMarkDelivered],
  );

  // Render order card
  const renderOrder = useCallback(
    ({ item: order }: { item: Order }) => {
      const readyItems = order.items.filter(i => i.status === 'ready');
      if (readyItems.length === 0) return null;

      const readyTime = order.readyAt || order.updatedAt;

      return (
        <FocusableCard
          focusKey={`order-${order.id}`}
          style={[
            styles.orderCard,
            {
              borderLeftColor: colors.success,
              borderLeftWidth: 6,
            },
          ]}>
          <View style={styles.orderHeader}>
            <View>
              <TVText variant="h2" bold>
                #{order.dailyNumber}
              </TVText>
              {order.tableNumber && (
                <TVText variant="bodyLarge" color="secondary">
                  {t('delivery.tableNumber', { number: order.tableNumber })}
                </TVText>
              )}
              {order.customerName && (
                <TVText variant="body" color="muted">
                  {order.customerName}
                </TVText>
              )}
            </View>
            <View style={styles.orderMeta}>
              <TVText variant="label" color="success">
                {readyItems.length} {readyItems.length === 1 ? 'Item' : 'Items'}
              </TVText>
              <TVText variant="caption" color="muted">
                {t('delivery.readySince', { time: getReadyTime(readyTime) })}
              </TVText>
            </View>
          </View>

          <View style={styles.itemsList}>
            {order.items.map(item => renderOrderItem(item, order.id))}
          </View>

          <View style={styles.orderFooter}>
            <FocusableButton
              onPress={() => handleMarkAllDelivered(order)}
              variant="primary"
              size="md"
              focusKey={`order-deliver-all-${order.id}`}>
              {t('delivery.markDelivered')} ({readyItems.length})
            </FocusableButton>
          </View>
        </FocusableCard>
      );
    },
    [colors, t, renderOrderItem, handleMarkAllDelivered, getReadyTime],
  );

  return (
    <FocusContext.Provider value={focusKey}>
      <View
        ref={containerRef}
        style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title={t('delivery.title')}
          subtitle={t('delivery.readyOrders') + ` (${readyOrders.length})`}
        />

        {readyOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <TVText variant="h3" color="muted" center>
              {t('delivery.noOrders')}
            </TVText>
          </View>
        ) : (
          <FlatList
            data={readyOrders}
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
    width: 450,
    padding: 0,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: TV_SIZES.spacingLg,
    borderBottomWidth: 1,
  },
  orderMeta: {
    alignItems: 'flex-end',
    gap: TV_SIZES.spacingXs,
  },
  itemsList: {
    padding: TV_SIZES.spacingMd,
    gap: TV_SIZES.spacingSm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: TV_SIZES.spacingMd,
    borderRadius: TV_SIZES.radiusMd,
    borderWidth: 2,
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
