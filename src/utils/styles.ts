import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ff00ff',
    flex: 1,
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: 'red',
  },
  bottomWrapper: {
    paddingHorizontal: 8,
    flex: 1,
    display: 'flex',
    backgroundColor: 'green',
  },
  userList: {
    width: '100%',
    backgroundColor: 'yellow',
    flex: 1,
  },
  userListContentContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ff00ff',
  },
});
