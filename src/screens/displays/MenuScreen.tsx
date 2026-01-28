import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/common';
import { TVText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useDisplaySocket } from '@/hooks/useDisplaySocket';
import { useDeviceStore, useDisplayStore, selectProductsByCategory } from '@/stores';
import { deviceApi } from '@/lib/api-client';
import { TV_SIZES, DISPLAY_REFRESH_INTERVAL } from '@/constants';
import type { Category, Product } from '@/types';

export const MenuScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { selectedEventId } = useDeviceStore();
  const { setCategories, setProducts } = useDisplayStore();
  const productsByCategory = useDisplayStore(selectProductsByCategory);

  // Connect to display socket
  useDisplaySocket();

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories', selectedEventId],
    queryFn: () =>
      selectedEventId ? deviceApi.getCategories(selectedEventId) : [],
    enabled: !!selectedEventId,
    refetchInterval: DISPLAY_REFRESH_INTERVAL,
  });

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['products', selectedEventId],
    queryFn: () =>
      selectedEventId ? deviceApi.getProducts(selectedEventId) : [],
    enabled: !!selectedEventId,
    refetchInterval: DISPLAY_REFRESH_INTERVAL,
  });

  // Update store when data changes
  useEffect(() => {
    if (categories) {
      setCategories(categories);
    }
  }, [categories, setCategories]);

  useEffect(() => {
    if (products) {
      setProducts(products);
    }
  }, [products, setProducts]);

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Render product item
  const renderProduct = useCallback(
    (product: Product) => (
      <View
        key={product.id}
        style={[
          styles.productItem,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: product.isAvailable ? 1 : 0.5,
          },
        ]}>
        <View style={styles.productInfo}>
          <TVText variant="bodyLarge" bold numberOfLines={1}>
            {product.name}
          </TVText>
          {product.description && (
            <TVText variant="caption" color="muted" numberOfLines={2}>
              {product.description}
            </TVText>
          )}
        </View>
        <View style={styles.productPrice}>
          <TVText variant="h3" bold style={{ color: colors.primary }}>
            {formatPrice(product.price)}
          </TVText>
          {!product.isAvailable && (
            <TVText variant="caption" color="error">
              {t('menu.outOfStock')}
            </TVText>
          )}
        </View>
      </View>
    ),
    [colors, t],
  );

  // Render category section
  const renderCategory = useCallback(
    ({
      item,
    }: {
      item: { category: Category; products: Product[] };
    }) => (
      <View style={styles.categorySection}>
        <View
          style={[
            styles.categoryHeader,
            {
              backgroundColor: item.category.color || colors.primary,
            },
          ]}>
          <TVText variant="h3" bold style={{ color: '#FFFFFF' }}>
            {item.category.name}
          </TVText>
          {item.category.description && (
            <TVText variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {item.category.description}
            </TVText>
          )}
        </View>
        <View style={styles.productList}>
          {item.products.map(renderProduct)}
        </View>
      </View>
    ),
    [colors, renderProduct],
  );

  if (productsByCategory.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title={t('menu.title')} />
        <View style={styles.emptyContainer}>
          <TVText variant="h3" color="muted" center>
            {t('menu.noProducts')}
          </TVText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('menu.title')} />
      <FlatList
        data={productsByCategory}
        renderItem={renderCategory}
        keyExtractor={item => item.category.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: TV_SIZES.spacingMd,
    paddingVertical: TV_SIZES.spacingMd,
  },
  categorySection: {
    width: 500,
    marginHorizontal: TV_SIZES.spacingMd,
  },
  categoryHeader: {
    padding: TV_SIZES.spacingMd,
    borderTopLeftRadius: TV_SIZES.radiusLg,
    borderTopRightRadius: TV_SIZES.radiusLg,
  },
  productList: {
    gap: 2,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: TV_SIZES.spacingMd,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  productInfo: {
    flex: 1,
    marginRight: TV_SIZES.spacingMd,
  },
  productPrice: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
