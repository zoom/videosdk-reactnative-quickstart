import { useEffect, useState } from "react";
import { Alert, SafeAreaView, View } from "react-native";
import { useIsMounted, usePermission } from "./src/utils/hooks";
import { VideoView } from "./src/video-view";
import { styles } from "./src/utils/styles";
import generateJwt from "./src/utils/jwt";
import {
  Errors,
  EventType,
  ZoomVideoSdkProvider,
  ZoomVideoSdkUser,
  ZoomVideoSdkUserType,
  useZoom,
} from "@zoom/react-native-videosdk";
import { params } from "./config";

export default function App() {
  usePermission();

  return (
    <ZoomVideoSdkProvider
      config={{ appGroupId: "test", domain: "zoom.us", enableLog: true }}
    >
      <Call />
    </ZoomVideoSdkProvider>
  );
}

const Call = () => {
  const zoom = useZoom();
  const isMounted = useIsMounted();
  const [users, setUsersInSession] = useState<ZoomVideoSdkUser[]>([]);
  const [fullScreenUser, setFullScreenUser] = useState<ZoomVideoSdkUser>();
  const [isInSession, setIsInSession] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  useEffect(() => {
    const join = async () => {
      const token = await generateJwt(params.sessionName, params.roleType);
      try {
        await zoom.joinSession({
          sessionName: params.sessionName,
          sessionPassword: params.sessionPassword,
          token: token,
          userName: params.displayName,
          audioOptions: {
            connect: true,
            mute: true,
            autoAdjustSpeakerVolume: false,
          },
          videoOptions: { localVideoOn: true },
          sessionIdleTimeoutMins: params.sessionIdleTimeoutMins,
        });
      } catch (e) {
        console.log(e);
      }
    };
    join();
  }, [zoom]);
  useEffect(() => {
    const sessionJoinListener = zoom.addListener(
      EventType.onSessionJoin,
      async (session: any) => {
        const mySelf = new ZoomVideoSdkUser(session.mySelf);
        const remoteUsers: ZoomVideoSdkUser[] =
          await zoom.session.getRemoteUsers();
        setUsersInSession([mySelf, ...remoteUsers]);
        setFullScreenUser(mySelf);
      }
    );

    const sessionLeaveListener = zoom.addListener(
      EventType.onSessionLeave,
      () => {
        setIsInSession(false);
        setUsersInSession([]);
      }
    );

    const sessionNeedPasswordListener = zoom.addListener(
      EventType.onSessionNeedPassword,
      () => {
        Alert.alert("SessionNeedPassword");
      }
    );

    const sessionPasswordWrongListener = zoom.addListener(
      EventType.onSessionPasswordWrong,
      () => {
        Alert.alert("SessionPasswordWrong");
      }
    );

    const userVideoStatusChangedListener = zoom.addListener(
      EventType.onUserVideoStatusChanged,
      async ({ changedUsers }: { changedUsers: ZoomVideoSdkUserType[] }) => {
        const mySelf: ZoomVideoSdkUser = new ZoomVideoSdkUser(
          await zoom.session.getMySelf()
        );
        changedUsers.map((u: ZoomVideoSdkUserType) => {
          if (mySelf.userId === u.userId) {
            mySelf.videoStatus.isOn().then((on) => setIsVideoOn(on));
          }
        });
      }
    );

    const userAudioStatusChangedListener = zoom.addListener(
      EventType.onUserAudioStatusChanged,
      async ({ changedUsers }: { changedUsers: ZoomVideoSdkUserType[] }) => {
        const mySelf: ZoomVideoSdkUser = new ZoomVideoSdkUser(
          await zoom.session.getMySelf()
        );
        changedUsers.map((u: ZoomVideoSdkUserType) => {
          if (mySelf.userId === u.userId) {
            mySelf.audioStatus.isMuted().then((muted) => setIsMuted(muted));
          }
        });
      }
    );

    const userJoinListener = zoom.addListener(
      EventType.onUserJoin,
      async ({ remoteUsers }: { remoteUsers: ZoomVideoSdkUserType[] }) => {
        if (!isMounted()) return;
        const mySelf = await zoom.session.getMySelf();
        const remote: ZoomVideoSdkUser[] = remoteUsers.map(
          (user: ZoomVideoSdkUserType) => new ZoomVideoSdkUser(user)
        );
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
        const mySelf: ZoomVideoSdkUser = await zoom.session.getMySelf();
        const remote: ZoomVideoSdkUser[] = remoteUsers.map(
          (user: ZoomVideoSdkUserType) => new ZoomVideoSdkUser(user)
        );
        if (fullScreenUser) {
          leftUsers.map((user: ZoomVideoSdkUserType) => {
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
      async (error: any) => {
        console.log("Error: " + JSON.stringify(error));
        Alert.alert("Error: " + error.error);
        switch (error.errorType) {
          case Errors.SessionJoinFailed:
            Alert.alert("Failed to join the session");
            break;
          default:
            Alert.alert("Failed to join the session");
        }
      }
    );

    return () => {
      sessionJoinListener.remove();
      sessionLeaveListener.remove();
      sessionPasswordWrongListener.remove();
      sessionNeedPasswordListener.remove();
      userVideoStatusChangedListener.remove();
      userAudioStatusChangedListener.remove();
      userJoinListener.remove();
      userLeaveListener.remove();
      eventErrorListener.remove();
    };
  }, [zoom, isMounted]);

  const leaveSession = (endSession: boolean) => {
    zoom.leaveSession(endSession);
  };
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
    <SafeAreaView style={styles.container}>
      <View style={styles.bottomWrapper}>
        {users.map((item) => (
          <View style={{ display: "flex", flex: 1 }}>
            <VideoView user={item} key={item.userId} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};
