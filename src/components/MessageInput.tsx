import { ImageIcon, MicIcon, SendHorizonalIcon, StickerIcon } from 'lucide-react';
import React from 'react';

interface MessageInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onSend?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ value = '', onChange, onSend }) => {
    return (
        <div className="p-4 h-20">
            <div className="flex gap-2 items-center max-w-full mx-auto h-full">
                <div className="relative w-full flex items-center h-full bg-gray-100 border border-gray-300 p-4 rounded-xl gap-2">
                    <input
                        placeholder="Type a message..."
                        className="text-gray-900 text-base w-full outline-none rounded-lg flex-1 bg-transparent"
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                    />

                    {/* Icons */}
                    <div className="flex items-center justify-center gap-2">
                        {/* Button: Mic */}
                        <button type="button" title="Voice Message">
                            <MicIcon className="w-5 h-5 text-gray-500 hover:text-gray-800" />
                        </button>

                        {/* Button: Image Upload */}
                        <button type="button" title="Send Image">
                            <ImageIcon className="w-5 h-5 text-gray-500 hover:text-gray-800" />
                        </button>

                        {/* Button: Sticker */}
                        <button type="button" title="Send Sticker">
                            <StickerIcon className="w-5 h-5 text-gray-500 hover:text-gray-800" />
                        </button>
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
