import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SmartExplainabilityPanel from '@/components/xai/SmartExplainabilityPanel';

export default function XaiScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa', paddingBottom: insets.bottom }}>
      <SmartExplainabilityPanel />
    </View>
  );
}


