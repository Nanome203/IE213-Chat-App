import { Message } from "@/utils/types";
import axios from "axios";
import {
  ImageIcon,
  MicIcon,
  PlayCircleIcon,
  SendHorizonalIcon,
  StickerIcon,
  StopCircleIcon,
  X,
} from "lucide-react";
import React, { useEffect, useRef } from "react";

interface MessageInputProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onChange?: (value: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  onFinishedSending?: () => void;
  onStartSending?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onFinishedSending,
  onStartSending,
  onTyping,
  onStopTyping,
  messages,
  setMessages,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = React.useState<string>("");
  const [previewImage, setPreviewImage] = React.useState<
    string | ArrayBuffer | null
  >(null);
  const [imageFile, setImageFile] = React.useState<File | undefined>();
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stream = useRef<MediaStream>(null);
  const audioChunks = useRef<Blob[]>([]);
  const voiceChat = useRef<Blob | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const discardRecoredVoice = useRef<boolean>(false);

  const currentUserId = localStorage.getItem("currentUserId");
  const selectedUser =
    JSON.parse(localStorage.getItem("selectedUser")!) || null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTyping?.();
    setText(e.target.value);
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping?.(); // tell server user stopped typing
      typingTimeoutRef.current = null;
    }, 800);
  };

  const startRecording = async () => {
    console.log("Starting");

    if (mediaRecorder.current === null) {
      try {
        stream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorder.current = new MediaRecorder(stream.current);

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            console.log("Pushed ", event.data);

            audioChunks.current.push(event.data);
          }
        };

        mediaRecorder.current.onstop = () => {
          stream.current?.getTracks().forEach((track) => track.stop()); // stop mic use, AI suggested
          // if (!discardRecoredVoice.current) {
          //   voiceChat.current = new Blob(audioChunks.current, {
          //     type: "audio/webm",
          //   });
          // }

          // const audioUrl = URL.createObjectURL(voiceChat.current!);
          // const audio = document.createElement("audio");
          // audio.src = audioUrl;
          // audio.play();

          audioChunks.current = [];
          mediaRecorder.current = null; // allow restarting, AI suggested
        };
        if (mediaRecorder.current.state === "inactive") {
          setIsRecording(true);
          mediaRecorder.current.start(1000);
        }
      } catch (err) {
        console.error("Microphone access denied or failed", err);
      }
    }
  };

  // this function will discard recorded voice, to not discard and send recorded voice to server, just press send button
  const stopRecording = () => {
    if (
      mediaRecorder.current !== null &&
      mediaRecorder.current.state !== "inactive"
    ) {
      // AI suggested we should not call stop() when the status is "paused"
      if (mediaRecorder.current.state === "paused") {
        mediaRecorder.current.resume();
      }
      setIsRecording(false);
      // discardRecoredVoice.current = true;
      mediaRecorder.current.stop();
      console.log("Stopping");
    }
  };

  const pauseRecording = () => {
    console.log("Pausing");

    if (
      mediaRecorder.current !== null &&
      mediaRecorder.current.state === "recording"
    ) {
      setIsPaused(true);
      mediaRecorder.current.pause();
    }
  };

  const resumeRecording = () => {
    console.log("Resuming");

    if (
      mediaRecorder.current !== null &&
      mediaRecorder.current.state === "paused"
    ) {
      setIsPaused(false);
      mediaRecorder.current.resume();
    }
  };

  const handleSelectedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected");
    }
    // Reset the input value to allow re-uploading the same file
    event.target.value = "";
  };

  const handleSendData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      text === "" &&
      imageFile === undefined &&
      audioChunks.current.length === 0
    )
      return;
    return new Promise((resolve) => {
      if (
        mediaRecorder.current !== null &&
        mediaRecorder.current.state !== "inactive"
      ) {
        // for voice recording
        // AI suggested we should not call stop() when the status is "paused"
        if (mediaRecorder.current.state === "paused") {
          mediaRecorder.current.resume();
        }
        setIsRecording(false);
        // discardRecoredVoice.current = false;
        mediaRecorder.current.onstop = () => {
          stream.current?.getTracks().forEach((track) => track.stop()); // stop mic use, AI suggested
          voiceChat.current = new Blob(audioChunks.current, {
            type: "audio/webm",
          });
          audioChunks.current = [];
          mediaRecorder.current = null; // allow restarting, AI suggested
          resolve(voiceChat.current);
        };
        mediaRecorder.current.stop();
      } else resolve(null);
    }).then(async (blob) => {
      const formData = new FormData();
      if (text !== "") {
        formData.append("text", text);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (voiceChat.current) {
        formData.append("voice", voiceChat.current);
      }
      if (onStartSending) {
        onStartSending();
        let newMessage = [
          ...messages.map((message) => message),
          {
            id: "temp",
            sender: currentUserId ?? "",
            createdAt: new Date().toISOString(),
            image: previewImage,
            text,
            voice: voiceChat.current
              ? URL.createObjectURL(voiceChat.current!)
              : null,
          } as Message,
        ];
        setMessages(newMessage);
      }
      const response = await axios.post(
        `http://localhost:3000/users/${currentUserId}/messages/${selectedUser.id}`,
        formData
      );
      if (response.data.status === 200) {
        setText("");
        setImageFile(undefined);
        setPreviewImage("");
        voiceChat.current = null;
        onFinishedSending && onFinishedSending();
      }
    });
  };

  // clean up the stream and recorder on unmount to avoid memory leaks, AI suggested
  // useEffect(() => {
  //   return () => {
  //     if (mediaRecorder.current) {
  //       try {
  //         if (mediaRecorder.current.state !== "inactive") {
  //           mediaRecorder.current.stop();
  //         }
  //       } catch (e) {
  //         console.warn("Failed to stop MediaRecorder on cleanup", e);
  //       }
  //     }
  //     stream.current?.getTracks().forEach((track) => track.stop());
  //     mediaRecorder.current = null;
  //     stream.current = null;
  //     audioChunks.current = [];
  //     voiceChat.current = null;
  //   };
  // }, []);

  return (
    <form className="p-4 bottom-0 left-0 right-0" onSubmit={handleSendData}>
      <div className="flex gap-2 items-end max-w-full mx-auto h-full">
        <div className="w-full h-full flex flex-col justify-end ">
          {/* Image Preview */}
          {previewImage && (
            <div className="mb-2 max-w-full h-2/3  flex items-end">
              <div className="relative bg-gray-100 rounded-lg">
                <img
                  src={previewImage as string}
                  alt="Preview"
                  className="w-30 h-30 object-contain rounded-lg"
                />
                <div className="absolute -top-4 -right-4 cursor-pointer bg-gray-700 hover:bg-gray-900 rounded-full p-2">
                  <X
                    className=" text-white"
                    onClick={() => {
                      setPreviewImage(null);
                      setImageFile(undefined);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="relative w-full flex items-center h-12 bg-gray-100 border border-gray-300 rounded-xl gap-2 px-2">
            <input
              placeholder="Type a message..."
              className={`text-gray-900 text-base w-full h-full outline-none rounded-lg flex-1 bg-transparent pl-4 ${
                isRecording ? (isPaused ? " pl-10" : "animate-pulse pl-10") : ""
              }`}
              value={isRecording ? "Recording..." : text}
              onChange={handleInputChange}
              disabled={isRecording}
            />
            {isRecording &&
              (isPaused ? (
                <div
                  className="absolute left-4 text-[#778ff9]"
                  onClick={resumeRecording}
                >
                  <PlayCircleIcon className="w-6 h-6" />
                </div>
              ) : (
                <div
                  className="absolute left-4 text-[#778ff9]"
                  onClick={pauseRecording}
                >
                  <StopCircleIcon className="w-6 h-6" />
                </div>
              ))}
            {/* Icons */}
            <div className="flex items-center justify-center gap-2">
              {/* Button: Mic */}

              {isRecording ? (
                <button
                  type="button"
                  title="Cancel Recording"
                  onClick={stopRecording}
                >
                  <X className="w-5 h-5 text-red-500 hover:text-red-700" />
                </button>
              ) : (
                <button
                  type="button"
                  title="Voice Message"
                  onClick={startRecording}
                >
                  <MicIcon className="w-5 h-5 text-gray-500 hover:text-gray-800" />
                </button>
              )}

              {/* Button: Image Upload */}
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleSelectedFile}
              />
              <button
                type="button"
                title="Send Image"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-5 h-5 text-gray-500 hover:text-gray-800 cursor-pointer" />
              </button>
              {/* Button: Sticker */}
              <button type="button" title="Send Sticker">
                <StickerIcon className="w-5 h-5 text-gray-500 hover:text-gray-800" />
              </button>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          className="flex justify-center items-center p-2.5 hover:bg-gray-100 rounded-xl"
          type="submit"
        >
          <SendHorizonalIcon className="w-6 h-6 text-[#778ff9]" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
