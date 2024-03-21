import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safe: {
    width: '90%',
    alignSelf: 'center',
    margin: 16,
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    alignSelf: 'center',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  spacer: {
    height: 16,
    width: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
  },
  buttonHolder: {
    flexDirection: "row",
    justifyContent: "center",
    margin: 8
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});
