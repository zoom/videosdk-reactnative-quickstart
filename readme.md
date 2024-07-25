# Zoom VideoSDK React Native Demo

Use of this sample app is subject to our [Terms of Use](https://explore.zoom.us/en/video-sdk-terms/).

This is a sample application that demonstrates how to use the Zoom Video SDK in a React Native application. Built with [Expo](https://https://docs.expo.dev/).

## Prerequisites

- [Environment setup](https://reactnative.dev/docs/environment-setup) for React Native
- Node (LTS) & Yarn
- A Zoom [Video SDK Account](https://developers.zoom.us/docs/video-sdk/get-credentials/)

## Getting Started

1. Clone the Repo

```bash
git clone https://github.com/zoom/VideoSDK-ReactNative-Quickstart.git
```

2. Install the dependencies

```bash
yarn
```

3. Install cocoapods (iOS only)

```bash
npx pod-install ## (or) cd ios && pod install
```

4. Add your Zoom Video SDK credentials

- Open `config.ts` and replace `ZOOM_APP_KEY` and `ZOOM_APP_SECRET` with your Zoom Video SDK credentials.

> **Disclaimer**: It's not recommended to store your credentials in the source code. This is only for demonstration purposes for sake of simplicity. You should use a secure backend to generate the token and pass it to the client.

5. Run the app

```bash
yarn ios
# or
yarn android
```

## How to setup in a fresh project

1. Create a new project, we recommend using Expo to simplify the setup

```bash
yarn create expo zoom-video-sdk --template # select Blank (Typescript)
# or
npx react-native@latest init zoomRNCli --template react-native-template-typescript
```

2. Install the Zoom Video SDK

```bash
yarn add @zoom/react-native-videosdk
```

- For iOS run: `npx pod-install` to install the pods

3. Add permissions for the camera and microphone

- Add the following to your `app.json`.

```json
{
  "expo": {
    "android": {
      "permissions": ["CAMERA", "RECORD_AUDIO"]
    },
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Text",
        "NSMicrophoneUsageDescription": "Text"
      }
    }
  }
}
```

If you're not using Expo:

- For iOS you'll have to add these to your `info.plist` manually.
- For Android, you can request permissions at runtime using the `Permissions` module as done in `usePermission` in [utils/lib.tsx](https://link/) or add these to your `AndroidManifest` file.

4. Wrap your app in the `ZoomVideoSdkProvider`

```tsx
function App() {
  ...
  return (
    <ZoomVideoSdkProvider config={{....}}>
      <YourApp>
    </ZoomVideoSdkProvider>
  );
```

5. Use the Zoom Video SDK

```tsx
function YourApp() {
  const zoom = useZoom();
  const handleJoin = async () => {
     await zoom.joinSession({....});
  }
  ...
```

6. Scaffold the native code (Skip if not using Expo)

```bash
npx expo prebuild
```

7. Run the app

- Expo

```bash
npx expo run:ios
# or
npx expo run:android
```

- React Native

```bash
npm run android
# or
npm run ios
```

## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or our [Developer Forum](https://devforum.zoom.us). Priority support is also available with [Premier Developer Support](https://explore.zoom.us/docs/en-us/developer-support-plans.html) plans.
