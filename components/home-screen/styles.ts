import { StyleSheet } from "react-native";

export default StyleSheet.create({
  fill: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  itemsRow: {
    flex: 1,
    flexDirection: "row",
  },
  pad: {
    flex: 1,
    margin: 20,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 10,
  },
});
