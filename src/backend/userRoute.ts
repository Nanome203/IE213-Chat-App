import Elysia, { t } from "elysia";
import { protectedRoute } from "./middleware";
import supabase from "@/utils/database";

export const userRoute = new Elysia({ prefix: "/users" })
  .use(protectedRoute)
  .get(
    "/",
    async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, name, isOnline:is_online");
      if (error) {
        return {
          status: 500,
          message: "Failed to get users",
        };
      }
      return {
        status: 200,
        data,
      };
    },
    {
      checkInvalidToken: true,
    }
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, avatar:image_url, phone")
        .eq("id", id);
      if (error) {
        return {
          status: 500,
          message: "Failed to retrieve user info",
        };
      }
      return {
        status: 200,
        data,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      checkInvalidToken: true,
    }
  )
  .get(
    "/:id/friends",
    async ({ params: { id } }) => {
      const { data, error } = await supabase
        .from("friends")
        .select(
          `
          invitorsInfo:users!friends_invitor_fkey(id,name, email, isOnline:is_online, avatar:image_url),
          invitedsInfo:users!friends_invited_fkey(id,name, email, isOnline:is_online, avatar:image_url)
          `
        )
        .or(`invitor.eq.${id}, invited.eq.${id}`);
      if (error) {
        return {
          status: 500,
          message: error,
        };
      }
      const cleanedData: any[] = [];
      data.forEach((obj) => {
        //ignore type error
        if (
          (obj.invitorsInfo as unknown as Record<string, string | boolean>)
            .id === id
        ) {
          cleanedData.push(obj.invitedsInfo);
          return;
        }
        //ignore type error
        if (
          (obj.invitedsInfo as unknown as Record<string, string | boolean>)
            .id === id
        ) {
          cleanedData.push(obj.invitorsInfo);
        }
      });
      return {
        status: 200,
        data: cleanedData,
      };
    },
    {
      checkInvalidToken: true,
    }
  );
