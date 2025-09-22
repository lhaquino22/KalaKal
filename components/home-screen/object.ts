import { Href } from "expo-router";
import { ImageSourcePropType } from "react-native";

interface Menu {
  image: ImageSourcePropType;
  icone: string;
  titulo: string;
  cor: string;
  screen: Href;
}
const menu: Menu[][] = [
  [
    {
      image: require("@/assets/images/calazar-icon.png"),
      icone: "book-open-page-variant",
      titulo: "Leishmaniose Visceral",
      cor: "peru",
      screen: "/leishmaniose",
    },
    {
      image: require("@/assets/images/linha-cuidado-icon.png"),
      icone: "file-tree",
      titulo: "Linha de Cuidado ao Paciente",
      cor: "cornflowerblue",
      screen: "/linhaPromocao",
    },
  ],
  [
    {
      image: require("@/assets/images/ocorrencias-icon.png"),
      icone: "map-marker-multiple",
      titulo: "Ocorrência dos Casos",
      cor: "lightcoral",
      screen: "/ocorrencias",
    },
    {
      image: require("@/assets/images/pontos-cuidado-icon.png"),
      icone: "hospital",
      titulo: "Pontos de Cuidado no Piauí",
      cor: "khaki",
      screen: "/pontosCuidado",
    },
  ],
  [
    {
      image: require("@/assets/images/plano-enfrentamento-icon.png"),
      icone: "chart-donut",
      titulo: "Plano de Enfrentamento e Controle de Doenças Negligenciadas",
      cor: "lightsalmon",
      screen: "/planoEnfrentamento",
    },
    {
      image: require("@/assets/images/kalacal-chart.png"),
      icone: "chart-areaspline",
      titulo: "XAI - Explicabilidade",
      cor: "seagreen",
      screen: "/xai" as any,
    }
    /* {
      image: require("@/assets/images/referencia-icon.png"),
      icone: "information-outline",
      titulo: "Referência e contrareferência",
      cor: "seagreen",
      screen: "/leishmaniose",
    }, */
  ],
];

export default menu;
