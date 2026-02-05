# Zoom VideoSDK React Native Demo

Use of this sample app is subject to our [Terms of Use](https://explore.zoom.us/en/video-sdk-terms/).

This is a sample application that demonstrates how to use the Zoom Video SDK in a React Native application. Built with [Expo](https://docs.expo.dev/).

## Prerequisites

- [Environment setup](https://reactnative.dev/docs/environment-setup) for React Native
- Node (LTS)
- [Bun](https://bun.sh/) (or a package manager of your choice)
- A Zoom [Video SDK Account](https://developers.zoom.us/docs/video-sdk/get-credentials/)

## Getting Started

1. Clone the Repo

```bash
git clone https://github.com/zoom/VideoSDK-ReactNative-Quickstart.git
```

2. Install the dependencies

```bash
bun install
```

3. Install cocoapods (iOS only)

```bash
bunx pod-install ## (or) cd ios && pod install
```

4. Run the app

```bash
bunx expo run:ios
# or
bunx expo run:android
```

5. In the input field for the JWT, input a JWT for your session name (default: "TestOne").

6. Click "Join" to join the session

## JWT Helper
The project provides a `generateToken.ts` file that can be used to generate a temporary JWT:
1. Create a `.env` file in the root directory of the project, you can do this by copying the `.env.example` file (`cp .env.example .env`) and replacing the values with your own. The `.env` file should look like this:

```
SDK_KEY=abc123XXXXXXXXXX
SDK_SECRET=abc123XXXXXXXXXX
```

2. Run `bun generateToken.ts TestOne --copy-to-clipboard`

The script generates a token for the proivded session name and the `--copy-to-clipboard` or `-c` flag copies it to your clipboard.

## How to setup in a fresh project

1. Create a new project, we recommend using Expo to simplify the setup

```bash
bunx create-expo-app zoom-video-sdk --template # select Blank (Typescript)
# or
bunx react-native@latest init zoomRNCli --template react-native-template-typescript
```

2. Install the Zoom Video SDK

```bash
bunx expo add @zoom/react-native-videosdk
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
bunx expo prebuild
```

7. Run the app

- Expo

```bash
bunx expo run:ios
# or
bunx expo run:android
```

- React Native

```bash
bun run android
# or
bun run ios
```

## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or our [Developer Forum](https://devforum.zoom.us). Priority support is also available with [Premier Developer Support](https://explore.zoom.us/docs/en-us/developer-support-plans.html) plans.
