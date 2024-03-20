import { useRef, useState } from "react";
import { Button, EmitterSubscription, SafeAreaView, View } from "react-native";
import { useIsMounted, usePermission } from "./src/utils/hooks";
import { VideoView } from "./src/video-view";
import { styles } from "./src/utils/styles";
import generateJwt from "./src/utils/jwt";
import {
  EventType,
  ZoomVideoSdkProvider,
  ZoomVideoSdkUser,
  ZoomVideoSdkUserType,
  useZoom,
} from "@zoom/react-native-videosdk";
import { config } from "./config";

export default function App() {
  usePermission();

  return (
    <ZoomVideoSdkProvider
      config={{ appGroupId: "test", domain: "zoom.us", enableLog: true }}
    >
      <SafeAreaView style={styles.container}>
        <Call />
      </SafeAreaView>
    </ZoomVideoSdkProvider>
  );
}

const Call = () => {
  const zoom = useZoom();
  const isMounted = useIsMounted();
  const listeners = useRef<EmitterSubscription[]>([]);
  const [users, setUsersInSession] = useState<ZoomVideoSdkUser[]>([]);
  const [fullScreenUser, setFullScreenUser] = useState<ZoomVideoSdkUser>();
  const [isInSession, setIsInSession] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const join = async () => {
    const token = await generateJwt(config.sessionName, config.roleType);

    const sessionJoinListener = zoom.addListener(
      EventType.onSessionJoin,
      async () => {
        const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
        const remoteUsers: ZoomVideoSdkUser[] =
          await zoom.session.getRemoteUsers();
        setUsersInSession([mySelf, ...remoteUsers]);
        setFullScreenUser(mySelf);
        setIsInSession(true);
      }
    );

    const sessionLeaveListener = zoom.addListener(
      EventType.onSessionLeave,
      () => {
        setIsInSession(false);
        setUsersInSession([]);
      }
    );

    const userVideoStatusChangedListener = zoom.addListener(
      EventType.onUserVideoStatusChanged,
      async ({ changedUsers }: { changedUsers: ZoomVideoSdkUserType[] }) => {
        const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
        changedUsers.map((u) => {
          if (mySelf.userId === u.userId) {
            mySelf.videoStatus.isOn().then((on) => setIsVideoOn(on));
          }
        });
      }
    );

    const userAudioStatusChangedListener = zoom.addListener(
      EventType.onUserAudioStatusChanged,
      async ({ changedUsers }: { changedUsers: ZoomVideoSdkUserType[] }) => {
        const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
        changedUsers.map((u) => {
          if (mySelf.userId === u.userId) {
            mySelf.audioStatus
              .isMuted()
              .then((muted) => setIsAudioMuted(muted));
          }
        });
      }
    );

    const userJoinListener = zoom.addListener(
      EventType.onUserJoin,
      async ({ remoteUsers }: { remoteUsers: ZoomVideoSdkUserType[] }) => {
        if (!isMounted()) return;
        const mySelf = await zoom.session.getMySelf();
        const remote = remoteUsers.map((user) => new ZoomVideoSdkUser(user));
        setUsersInSession([mySelf, ...remote]);
      }
    );

    const userLeaveListener = zoom.addListener(
      EventType.onUserLeave,
      async ({
        remoteUsers,
        leftUsers,
      }: {
        remoteUsers: ZoomVideoSdkUserType[];
        leftUsers: ZoomVideoSdkUserType[];
      }) => {
        if (!isMounted()) return;
        const mySelf = await zoom.session.getMySelf();
        const remote = remoteUsers.map((user) => new ZoomVideoSdkUser(user));
        if (fullScreenUser) {
          leftUsers.map((user) => {
            if (fullScreenUser.userId === user.userId) {
              setFullScreenUser(mySelf);
              return;
            }
          });
        } else {
          setFullScreenUser(mySelf);
        }
        setUsersInSession([mySelf, ...remote]);
      }
    );

    const eventErrorListener = zoom.addListener(
      EventType.onError,
      async (error: any) => console.log("Error: " + JSON.stringify(error))
    );
    listeners.current.push(sessionJoinListener);
    listeners.current.push(sessionLeaveListener);
    listeners.current.push(userVideoStatusChangedListener);
    listeners.current.push(userAudioStatusChangedListener);
    listeners.current.push(userJoinListener);
    listeners.current.push(userLeaveListener);
    listeners.current.push(eventErrorListener);

    try {
      await zoom.joinSession({
        sessionName: config.sessionName,
        sessionPassword: config.sessionPassword,
        token: token,
        userName: config.displayName,
        audioOptions: {
          connect: true,
          mute: true,
          autoAdjustSpeakerVolume: false,
        },
        videoOptions: { localVideoOn: true },
        sessionIdleTimeoutMins: config.sessionIdleTimeoutMins,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const leaveSession = () => {
    zoom.leaveSession(false);
    listeners.current.forEach((listener) => listener.remove());
    listeners.current = [];
    setIsInSession(false);
  };

  return isInSession ? (
    <View style={styles.bottomWrapper}>
      {users.map((user) => (
        <View style={{ display: "flex", flex: 1 }} key={user.userId}>
          <VideoView user={user} key={user.userId} />
        </View>
      ))}
      <MuteButtons isAudioMuted={isAudioMuted} isVideoOn={isVideoOn} />
      <Button
        title="Leave Session"
        onPress={async () => {
          leaveSession();
        }}
      />
    </View>
  ) : (
    <View style={styles.bottomWrapper}>
      <Button
        title="Join Session"
        onPress={async () => {
          await join();
        }}
      />
    </View>
  );
};

const MuteButtons = ({
  isAudioMuted,
  isVideoOn,
}: {
  isAudioMuted: boolean;
  isVideoOn: boolean;
}) => {
  const zoom = useZoom();
  const onPressAudio = async () => {
    const mySelf = await zoom.session.getMySelf();
    const muted = await mySelf.audioStatus.isMuted();
    muted
      ? await zoom.audioHelper.unmuteAudio(mySelf.userId)
      : await zoom.audioHelper.muteAudio(mySelf.userId);
  };

  const onPressVideo = async () => {
    const mySelf = await zoom.session.getMySelf();
    const videoOn = await mySelf.videoStatus.isOn();
    videoOn
      ? await zoom.videoHelper.stopVideo()
      : await zoom.videoHelper.startVideo();
  };
  return (
    <View>
      <Button
        title={isAudioMuted ? "Unmute" : "Mute"}
        onPress={async () => {
          await onPressAudio();
        }}
      />
      <Button
        title={isVideoOn ? "Stop Video" : "Start Video"}
        onPress={async () => {
          await onPressVideo();
        }}
      />
    </View>
  );
};
