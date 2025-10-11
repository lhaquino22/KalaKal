import React from 'react';
import { View, StyleSheet } from 'react-native';
import SmartExplainabilityPanel from '@/components/xai/SmartExplainabilityPanel';

export default function XaiScreen() {
  return (
    <View style={styles.container}>
      <SmartExplainabilityPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
});


