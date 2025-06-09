import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY!;
const secret = process.env.STREAM_SECRET!;

export const streamClient = StreamChat.getInstance(apiKey, secret);
