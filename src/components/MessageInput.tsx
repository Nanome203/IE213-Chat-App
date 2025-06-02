import {
  ImageIcon,
  MicIcon,
  SendHorizonalIcon,
  StickerIcon,
  X,
} from "lucide-react";
import React, { useRef } from "react";

interface MessageInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value = "",
  onChange,
  onSend,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = React.useState<string>("");
  const [previewImage, setPreviewImage] = React.useState<
    string | ArrayBuffer | null
  >(null);
  const [imageURL, setImageURL] = React.useState<string>("");

  const handleSelectedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Here you can handle the file data, e.g., send it to a server or display it
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected");
    }
    // Reset the input value to allow re-uploading the same file
    event.target.value = "";
  };

  return (
    <div className="p-4 h-60 absolute bottom-0 left-0 right-0">
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
                      setImageURL("");
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="relative w-full flex items-center h-12 bg-gray-100 border border-gray-300 rounded-xl gap-2 px-2">
            <input
              placeholder="Type a message..."
              className="text-gray-900 text-base w-full h-full outline-none rounded-lg flex-1 bg-transparent pl-4"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {/* Icons */}
            <div className="flex items-center justify-center gap-2">
              {/* Button: Mic */}
              <button type="button" title="Voice Message">
                <MicIcon className="w-5 h-5 text-gray-500 hover:text-gray-800" />
              </button>
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
          onClick={onSend}
        >
          <SendHorizonalIcon className="w-6 h-6 text-[#778ff9]" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
