import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TVText } from '@/components/ui';

interface ClockProps {
  showDate?: boolean;
}

export const Clock: React.FC<ClockProps> = ({ showDate = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <TVText variant="h3" bold>
        {formatTime(time)}
      </TVText>
      {showDate && (
        <TVText variant="caption" color="secondary">
          {formatDate(time)}
        </TVText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
});
