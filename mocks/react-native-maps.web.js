// Mock para react-native-maps no web
import React from 'react';
import { View, Text } from 'react-native';

// Mock dos componentes principais
export const MapView = ({ children, ...props }) => (
  <View style={{ flex: 1, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
    <Text>Mapa não disponível no web</Text>
    {children}
  </View>
);

export const Marker = ({ children }) => <View>{children}</View>;
export const Callout = ({ children }) => <View>{children}</View>;
export const Polygon = () => <View />;

export default MapView;
