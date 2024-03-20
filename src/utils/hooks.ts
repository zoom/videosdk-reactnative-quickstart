import { useRef, useCallback, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

export const useIsMounted = () => {
  const mountedRef = useRef(false);
  const isMounted = useCallback(() => mountedRef.current, []);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  return isMounted;
};

export async function requestCameraAndAudioPermission() {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    if (
      granted["android.permission.RECORD_AUDIO"] ===
      PermissionsAndroid.RESULTS.GRANTED &&
      granted["android.permission.CAMERA"] ===
      PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log("You can use the cameras & mic");
    } else {
      console.log("Permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
}

export const usePermission = () => {
  useEffect(() => {
    if (Platform.OS === "android") {
      requestCameraAndAudioPermission().then(() => {
        console.log("requested!");
      });
    }
  }, []);
}