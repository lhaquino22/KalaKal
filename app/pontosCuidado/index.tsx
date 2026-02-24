import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useRef, useState } from "react";
import { Linking, TouchableOpacity, View } from "react-native";
import MapView, { Callout, Marker, Polygon } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../commons";
import style from "../../components/care-spots/styles";
import { Text } from "react-native";

import pontos from "../../components/care-spots/object";
import polygons from "../../components/care-spots/poligonos";

interface LatLng {
  longitude: number;
  latitude: number;
}

interface MarkerPoint extends LatLng {
  nome: string;
  telefone: string;
  address: string;
  tipo: Array<{ cuidado: string }>;
}

interface PolygonFeature {
  properties: {
    name: string;
    fill: string;
    "fill-opacity": number;
    stroke: string;
    "stroke-opacity": number;
    "stroke-width": number;
  };
  geometry: {
    coordinates: number[][][];
  };
}

interface PolygonData {
  features: PolygonFeature[];
}

export default function PontosCuidadoScreen() {
  const insets = useSafeAreaInsets();
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  const fitAllMarkers = () => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(pontos as LatLng[], {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  };

  const onMapLayout = () => {
    fitAllMarkers();
    setIsMapReady(true);
  };

  const toLatLng = (coordinates: number[][][]): LatLng[] => {
    let latLng_coordinates: LatLng[] = [];
    coordinates[0].forEach((coordinate) => {
      latLng_coordinates.push({
        longitude: coordinate[0],
        latitude: coordinate[1],
      });
    });
    return latLng_coordinates;
  };

  const hex2rgba = (hex: string, alpha = 1): string => {
    const [r, g, b] = hex.match(/\w\w/g)!.map((x) => parseInt(x, 16));
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <View style={style.flex}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        showsUserLocation
        onMapReady={onMapLayout}
        initialRegion={{
          latitude: -5.0881867,
          longitude: -42.8056137,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
      >
        {isMapReady &&
          (pontos as MarkerPoint[]).map((marker) => (
            <Marker
              key={marker.nome}
              coordinate={marker}
              title={marker.nome}
              description="Clique para traçar uma rota."
              onCalloutPress={() => Linking.openURL(marker.address)}
              pinColor="red"
            >
              <Callout
                style={{
                  minHeight: 150,
                  maxHeight: 350,
                  width: 200,
                  padding: 10,
                  backgroundColor: "white",
                }}
              >
                <Text style={style.markerTitle}>{marker.nome}</Text>
                <Text style={style.markerPhone}>{marker.telefone}</Text>
                <View style={style.cuidados}>
                  {marker.tipo.map((t) => (
                    <View style={style.cuidado} key={marker.nome + t.cuidado}>
                      <Text style={style.textoCuiado}>{t.cuidado}</Text>
                    </View>
                  ))}
                </View>
                <View style={style.markerButtonContainer}>
                  <Text style={style.markerButton}>Traçar rota</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        {(polygons as PolygonData).features.map((polygon) => (
          <Polygon
            key={polygon.properties.name}
            coordinates={toLatLng(polygon.geometry.coordinates)}
            fillColor={hex2rgba(
              polygon.properties.fill,
              polygon.properties["fill-opacity"]
            )}
            strokeColor={hex2rgba(
              polygon.properties.stroke,
              polygon.properties["stroke-opacity"] * 0
            )}
            strokeWidth={polygon.properties["stroke-width"]}
          />
        ))}
      </MapView>
      <View style={[style.menu, { bottom: insets.bottom + 20 }]}>
        <TouchableOpacity onPress={fitAllMarkers} style={style.centerButton}>
          <Icon
            name="image-filter-center-focus"
            size={40}
            color={colors.secondaryColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
