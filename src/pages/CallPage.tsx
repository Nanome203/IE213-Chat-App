import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  Call,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import axios from "axios";

function CallPage({
  setIsCalling,
  isCallRejected,
  setIsCallRejected,
  ws,
  roomId,
  setShowCallModal,
}: {
  setIsCalling: React.Dispatch<React.SetStateAction<boolean>>;
  isCallRejected: boolean;
  setIsCallRejected: React.Dispatch<React.SetStateAction<boolean>>;
  ws: WebSocket | undefined;
  roomId: string;
  setShowCallModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "");
  const selectedUser =
    JSON.parse(localStorage.getItem("selectedUser")!) || null;

  useEffect(() => {
    const initCall = async () => {
      if (!currentUser.id) {
        return;
      }
      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: currentUser.id,
          name: currentUser.name,
          image: currentUser.avatar,
        };

        const response = await axios.get(
          `http://localhost:3000/voice/token/${currentUser.id}`
        );

        if (response.data.status === 200) {
          const videoClient = new StreamVideoClient({
            apiKey: response.data.data.apiKey,
            user,
            token: response.data.data.token,
          });

          const callInstance = videoClient.call(
            "default",
            roomId === "" ? currentUser.id! : roomId
          );

          await callInstance.join({ create: true });

          console.log("Joined call successfully");

          setClient(videoClient);
          setCall(callInstance);
        }
      } catch (error) {
        console.error("Error joining call:", error);
      } finally {
        setIsConnecting(false);

        // only caller could send "roomIsReady", not receiver
        currentUser.id === (roomId === "" ? currentUser.id! : roomId) &&
          ws?.send(
            JSON.stringify({
              type: "roomIsReady",
              roomId: currentUser.id,
              receiver: selectedUser.id,
            })
          );
      }
    };
    initCall();
  }, []);

  useEffect(() => {
    if (isCallRejected && call) {
      call.endCall().then(() => {
        setIsCallRejected(false);
        setIsCalling(false);
      });
    }
  }, [isCallRejected]);
  if (isConnecting)
    return (
      <div className="w-screen h-screen flex justify-center items-center text-5xl">
        Loading...
      </div>
    );
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent
                setIsCalling={setIsCalling}
                setShowCallModal={setShowCallModal}
                call={call}
              />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const CallContent = ({
  setIsCalling,
  setShowCallModal,
  call,
}: {
  setIsCalling: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCallModal: React.Dispatch<React.SetStateAction<boolean>>;
  call: Call;
}) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      call.endCall().then(() => {
        console.log("Successfully ended call");
      });

      // somehow setting these states make quitting calls faster
      setIsCalling(false);
      setShowCallModal(false);
    }
  }, [callingState]);

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls />
    </StreamTheme>
  );
};
export default CallPage;
