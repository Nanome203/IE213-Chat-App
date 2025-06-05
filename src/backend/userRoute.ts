import Elysia, { t } from "elysia";
import { protectedRoute } from "./middleware";
import supabase from "@/utils/database";
type User = {
  name?: string;
  password?: string;
  updated_at?: string;
  deleted_at?: string;
  image_url?: string;
  is_online?: string;
  phone?: string;
};
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
  .put(
    "/:id",
    async ({ body: { name, password, phone, avatar }, params: { id } }) => {
      let updatedUser: User = {
        updated_at: new Date().toISOString(),
      };
      if (name) {
        updatedUser = { ...updatedUser, name: name };
      }
      if (password) {
        const hashedPassword = await Bun.password.hash(password, {
          algorithm: "bcrypt",
        });
        updatedUser = { ...updatedUser, password: hashedPassword };
      }

      if (phone) {
        updatedUser = { ...updatedUser, phone: phone };
      }

      if (avatar) {
        // do nothing for now
      }

      try {
        const { error } = await supabase
          .from("users")
          .update(updatedUser)
          .eq("id", id);
        if (error) {
          return {
            status: 500,
            message: "Failed to update user profile",
          };
        }
        return {
          status: 200,
          data: updatedUser,
        };
      } catch (e) {
        const { error } = await supabase
          .from("users")
          .update(updatedUser)
          .eq("id", id);
        if (error) {
          return {
            status: 500,
            message: "Failed to update user profile",
          };
        }
        return {
          status: 200,
          data: updatedUser,
        };
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        password: t.Optional(t.String({ minLength: 8 })),
        phone: t.Optional(t.String()),
        avatar: t.Optional(t.File()),
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
        (obj.invitorsInfo as unknown as Record<string, string | boolean>).id ===
        id
          ? cleanedData.push(obj.invitedsInfo)
          : cleanedData.push(obj.invitorsInfo);
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
