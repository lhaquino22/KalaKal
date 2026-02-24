import { colors } from "@/commons";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CareLevelData {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
  actions: string[];
}

const careLevels: CareLevelData[] = [
  {
    title: "Promoção da Saúde",
    icon: "heart-outline",
    color: "#EC4899",
    description:
      "Ações integradas de educação, prevenção e controle ambiental para reduzir a transmissão da leishmaniose visceral.",
    actions: [
      "Educação em saúde sobre o ciclo de transmissão, sinais clínicos e medidas de prevenção da LV, com linguagem acessível à comunidade",
      "Capacitação de Agentes Comunitários de Saúde (ACS) e Agentes de Combate a Endemias (ACE) para orientação da população",
      "Manejo ambiental: limpeza de quintais, remoção de matéria orgânica, poda de árvores e destino adequado de lixo orgânico",
      "Orientação sobre medidas de proteção individual: telas de malha fina, mosquiteiros impregnados com inseticida e uso de repelentes",
      "Promoção do uso de coleiras impregnadas com deltametrina a 4% nos cães, conforme recomendação do Ministério da Saúde",
      "Mobilização comunitária para eliminação de criadouros do vetor no peridomicílio",
    ],
  },
  {
    title: "Vigilância em Saúde",
    icon: "eye-outline",
    color: colors.mainColor,
    description:
      "Monitoramento epidemiológico, vigilância entomológica, controle do reservatório canino e notificação compulsória.",
    actions: [
      "Notificação compulsória semanal de todo caso suspeito no SINAN, com encerramento em até 60 dias",
      "Investigação epidemiológica: coleta de dados clínicos, identificação da área provável de infecção e presença de vetor e reservatórios",
      "Estratificação de risco dos municípios conforme média de casos nos últimos 3 anos (sem transmissão, esporádica, moderada ou intensa)",
      "Vigilância entomológica: pesquisas periódicas para monitorar presença, distribuição e densidade de flebotomíneos",
      "Inquéritos sorológicos caninos censitários ou amostrais com teste rápido (DPP) como triagem e ELISA como confirmatório",
      "Controle vetorial com borrifação de inseticida residual em áreas de transmissão moderada e intensa",
      "Investigação de óbitos por LV e monitoramento de indicadores: incidência, letalidade, proporção de casos graves e coinfecção LV/HIV",
    ],
  },
  {
    title: "Atenção Primária",
    icon: "medkit-outline",
    color: "#EAB308",
    description:
      "Detecção precoce, diagnóstico com teste rápido, tratamento ambulatorial de casos sem gravidade e acompanhamento pós-tratamento.",
    actions: [
      "Suspeição clínica por equipes da ESF diante de febre prolongada (>14 dias) com esplenomegalia em área endêmica",
      "Busca ativa de casos febris prolongados pelos ACS nas visitas domiciliares",
      "Diagnóstico com teste rápido imunocromatográfico (rK39) disponível nas UBS, com sensibilidade de 90-95%",
      "Solicitação de exames complementares: hemograma, proteínas séricas, transaminases, ureia e creatinina",
      "Tratamento ambulatorial com Antimoniato de N-Metil Glucamina (20 mg Sb+5/kg/dia) para casos sem sinais de gravidade, com monitoramento por ECG e exames laboratoriais",
      "Acompanhamento pós-tratamento aos 3, 6 e 12 meses com avaliação clínica e laboratorial",
      "Referenciamento para atenção especializada quando houver sinais de alerta ou gravidade, coinfecção LV/HIV, idade <1 ano ou >50 anos, ou gestantes",
    ],
  },
  {
    title: "Atenção Especializada",
    icon: "hospital-outline",
    color: "#22C55E",
    description:
      "Manejo hospitalar de casos moderados a graves, tratamento com Anfotericina B Lipossomal e cuidados intensivos.",
    actions: [
      "Internação hospitalar para pacientes com sinais de gravidade: icterícia, hemorragias, edema generalizado, instabilidade hemodinâmica ou sinais de toxemia",
      "Tratamento de primeira escolha com Anfotericina B Lipossomal (3 mg/kg/dia por 7 dias) para: idade <1 ou >50 anos, escore de gravidade elevado, insuficiência renal/hepática/cardíaca, gestantes e coinfecção LV/HIV",
      "Aplicação do escore de gravidade do Ministério da Saúde: escore clínico ≥4 ou clínico-laboratorial ≥6 indica Anfotericina B Lipossomal",
      "Manejo de coinfecção LV/HIV: testagem universal para HIV, tratamento com Anfotericina B Lipossomal, início de TARV e profilaxia secundária para prevenção de recidivas",
      "Tratamento de complicações: antibioticoterapia empírica para infecções bacterianas (principal causa de óbito), transfusão para anemia grave, correção de distúrbios eletrolíticos",
      "Monitoramento rigoroso durante tratamento: função renal, hepática, eletrólitos (potássio e magnésio), hemograma e ECG",
      "Admissão em UTI quando houver choque, insuficiência respiratória, hemorragia grave, sepse ou falência orgânica múltipla",
      "Contra-referência para APS após estabilização, com plano de acompanhamento pós-tratamento aos 3, 6 e 12 meses",
    ],
  },
];

export default function LinhaPromocao() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <Text style={styles.introText}>
          Linha de cuidado ao paciente com Leishmaniose Visceral conforme
          diretrizes do Ministério da Saúde e do SUS, organizada por níveis de
          atenção.
        </Text>

        <View style={styles.cardsContainer}>
          {careLevels.map((level, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <TouchableOpacity
                key={level.title}
                activeOpacity={0.7}
                onPress={() => toggleExpand(index)}
                style={[
                  styles.card,
                  { borderLeftColor: level.color, borderLeftWidth: 4 },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Ionicons name={level.icon} size={24} color={level.color} />
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle}>{level.title}</Text>
                    <Text style={styles.cardDescription}>
                      {level.description}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#9CA3AF"
                  />
                </View>

                {isExpanded && (
                  <View style={styles.cardContent}>
                    {level.actions.map((action, actionIndex) => (
                      <View key={actionIndex} style={styles.actionItem}>
                        <View
                          style={[
                            styles.actionBullet,
                            { backgroundColor: level.color },
                          ]}
                        />
                        <Text style={styles.actionText}>{action}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sourceText}>
          Baseado no Manual de Vigilância e Controle da Leishmaniose Visceral e
          nas Recomendações Clínicas para Redução da Letalidade do Ministério da
          Saúde.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  introText: {
    fontSize: 14,
    color: "#6B7280",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    lineHeight: 20,
  },
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  cardContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 10,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  actionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  sourceText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginHorizontal: 20,
    marginBottom: 24,
    lineHeight: 16,
    fontStyle: "italic",
  },
});
