import {
  EventType,
  VideoAspect,
  ZoomVideoSdkProvider,
  ZoomVideoSdkUser,
  ZoomView,
  useZoom
} from "@zoom/react-native-videosdk";
import { useRef, useState } from "react";
import { EmitterSubscription, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { config } from "../config";
import generateJwt from "../utils/jwt";
import Button, { usePermission } from "../utils/lib";
import { styles } from "../utils/styles";

export default function App() {
  usePermission();

  return (
    <ZoomVideoSdkProvider config={{ appGroupId: "test", domain: "zoom.us", enableLog: true }}>
      <SafeAreaView style={styles.safe}>
        <Call />
      </SafeAreaView>
    </ZoomVideoSdkProvider>
  );
}

const Call = () => {
  const zoom = useZoom();
  const listeners = useRef<EmitterSubscription[]>([]);
  const [users, setUsersInSession] = useState<ZoomVideoSdkUser[]>([]);
  const [isInSession, setIsInSession] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const join = async () => {
    /* Disclaimer: JWT should be generated from your server */
    const token = await generateJwt(config.sessionName, config.roleType);

    const sessionJoin = zoom.addListener(EventType.onSessionJoin, async () => {
      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      const remoteUsers = await zoom.session.getRemoteUsers();
      setUsersInSession([mySelf, ...remoteUsers]);
      setIsInSession(true);
    });
    listeners.current.push(sessionJoin);

    const userJoin = zoom.addListener(EventType.onUserJoin, async (_event) => {
      const remoteUsers = await zoom.session.getRemoteUsers();
      const mySelf = await zoom.session.getMySelf();
      setUsersInSession([mySelf, ...remoteUsers]);
    });
    listeners.current.push(userJoin);

    const userLeave = zoom.addListener(EventType.onUserLeave, async (_event) => {
      const remoteUsers = await zoom.session.getRemoteUsers();
      const mySelf = await zoom.session.getMySelf();
      setUsersInSession([mySelf, ...remoteUsers]);
    });
    listeners.current.push(userLeave);

    const userVideo = zoom.addListener(EventType.onUserVideoStatusChanged, async (event) => {
      const { changedUsers } = event;
      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      if (changedUsers.find((user) => user.userId === mySelf.userId))
        mySelf.videoStatus.isOn().then((on) => setIsVideoMuted(!on));
    });
    listeners.current.push(userVideo);

    const userAudio = zoom.addListener(EventType.onUserAudioStatusChanged, async (event) => {
      const { changedUsers } = event;
      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      if (changedUsers.find((user) => user.userId === mySelf.userId))
        mySelf.audioStatus.isMuted().then((muted) => setIsAudioMuted(muted));
    });
    listeners.current.push(userAudio);

    const sessionLeave = zoom.addListener(EventType.onSessionLeave, () => {
      setIsInSession(false);
      setUsersInSession([]);
      sessionLeave.remove();
    });

    await zoom.joinSession({
      sessionName: config.sessionName,
      sessionPassword: config.sessionPassword,
      token: token,
      userName: config.displayName,
      audioOptions: { connect: true, mute: true, autoAdjustSpeakerVolume: false },
      videoOptions: { localVideoOn: true },
      sessionIdleTimeoutMins: config.sessionIdleTimeoutMins,
    }).catch((e) => {
      console.log(e);
    });
  };

  const leaveSession = () => {
    try {
      zoom.leaveSession(false);
      setIsInSession(false);
      listeners.current.forEach((listener) => {
        try {
          listener.remove();
        } catch (e) {
          console.log('error removing listener', e);
        }
      });
      listeners.current = [];
    } catch (e) { console.log('error leaving session', e) }
  };

  return isInSession ? (
    <View style={styles.container}>
      {users.map((user) => (
        <ZoomView
          style={styles.container}
          userId={user.userId}
          fullScreen
          key={user.videoStatus.userId}
          videoAspect={VideoAspect.PanAndScan}
        />
      ))}
      <MuteButtons isAudioMuted={isAudioMuted} isVideoMuted={isVideoMuted} />
      <Button title="Leave Session" color={"#f01040"} onPress={leaveSession} />
    </View>
  ) : (
    <View style={styles.container}>
      <Text style={styles.heading}>Zoom Video SDK</Text>
      <Text style={styles.heading}>React Native Quickstart</Text>
      <View style={styles.spacer} />
      <Button title="Join Session" onPress={join} />
    </View>
  );
};

const MuteButtons = ({ isAudioMuted, isVideoMuted }: { isAudioMuted: boolean; isVideoMuted: boolean }) => {
  const zoom = useZoom();
  const onPressAudio = async () => {
    const mySelf = await zoom.session.getMySelf();
    const muted = await mySelf.audioStatus.isMuted();
    if (muted) await zoom.audioHelper.unmuteAudio(mySelf.userId);
    else await zoom.audioHelper.muteAudio(mySelf.userId);
  };

  const onPressVideo = async () => {
    const mySelf = await zoom.session.getMySelf();
    const videoOn = await mySelf.videoStatus.isOn();
    if (videoOn) await zoom.videoHelper.stopVideo();
    else await zoom.videoHelper.startVideo();
  };
  return (
    <View style={styles.buttonHolder}>
      <Button title={isAudioMuted ? "Unmute Audio" : "Mute Audio"} onPress={onPressAudio} />
      <View style={styles.spacer} />
      <Button title={isVideoMuted ? "Unmute Video" : "Mute Video"} onPress={onPressVideo} />
    </View>
  );
};
