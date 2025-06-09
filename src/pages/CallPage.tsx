import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

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

function CallPage() {
  const { id: callId } = useParams();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "");

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

          const callInstance = videoClient.call("default", callId!);

          await callInstance.join({ create: true });

          console.log("Joined call successfully");

          setClient(videoClient);
          setCall(callInstance);
        }
      } catch (error) {
        console.error("Error joining call:", error);
      } finally {
        setIsConnecting(false);
      }
    };
    initCall();
  }, []);

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
              <CallContent />
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

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      window.close();
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
