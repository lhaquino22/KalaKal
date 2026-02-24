import estilo from "@/components/confrontation-plan/styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const objetivos = [
  "Melhorar a resposta às doenças negligenciadas no Piauí",
  "Enfrentar os fatores de risco de adoecimento da população",
  "Detectar oportunamente as doenças",
  "Apoiar intervenções de prevenção, diagnóstico, tratamento e controle",
];

const doencas = [
  "Tuberculose",
  "Hanseníase",
  "Doença de Chagas",
  "Leishmaniose",
  "Geohelmintíases",
];

export default function PlanoEnfrentamento() {
  const introducao = `Este plano encontra-se inserido no Projeto Piauí Pilares de Crescimento e Inclusão Social do Governo do Estado do Piauí, efetivado por convênio com o Banco Mundial, em conjunto com as secretarias Estaduais de Planejamento, Educação, Desenvolvimento Rural, Meio Ambiente e Instituto de Terras do Piauí.`;

  const handleAbrirArquivo = () => {
    Linking.openURL(
      "https://docs.bvsalud.org/biblioref/2020/09/1118911/plano_estadual_das_negligenciadas_piau__2015_2018_para_livreto.pdf"
    );
  };

  return (
    <ScrollView style={estilo.container}>
      <View style={estilo.content}>
        <Text style={estilo.descricao}>{introducao}</Text>

        {/* Objetivos */}
        <View style={estilo.section}>
          <Text style={estilo.sectionTitle}>Objetivos do Plano</Text>
          {objetivos.map((objetivo, index) => (
            <View key={index} style={estilo.objectiveItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#22C55E"
              />
              <Text style={estilo.objectiveText}>{objetivo}</Text>
            </View>
          ))}
        </View>

        {/* Doenças Contempladas */}
        <View style={estilo.section}>
          <Text style={estilo.sectionTitle}>Doenças Contempladas</Text>
          <View style={estilo.tagsContainer}>
            {doencas.map((doenca) => (
              <View key={doenca} style={estilo.tag}>
                <Text style={estilo.tagText}>{doenca}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botão de Download */}
        <TouchableOpacity
          style={estilo.downloadButton}
          onPress={handleAbrirArquivo}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={22} color="white" />
          <View style={estilo.downloadTextContainer}>
            <Text style={estilo.downloadButtonText}>
              Abrir Documento Completo
            </Text>
            <Text style={estilo.downloadButtonSubtext}>PDF — BVS Saúde</Text>
          </View>
          <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
