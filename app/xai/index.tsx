import React from 'react';
import { View, StyleSheet } from 'react-native';
import MultiModelExplainabilityPanel from '@/components/xai/MultiModelExplainabilityPanel';

export default function XaiScreen() {
  return (
    <View style={styles.container}>
      <MultiModelExplainabilityPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
});


