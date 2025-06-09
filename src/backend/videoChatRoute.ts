import { streamClient } from "@/utils/stream";
import Elysia, { t } from "elysia";

export const voiceChatRoute = new Elysia({
  prefix: "/voice",
}).get("/token/:id", async ({ params: { id } }) => {
  return {
    status: 200,
    data: {
      apiKey: process.env.STREAM_API_KEY!,
      token: streamClient.createToken(id),
    },
  };
});
