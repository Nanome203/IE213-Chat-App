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
  .patch(
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
        const fileName = `${id}/${Date.now()}_${(avatar as File).name}`;

        // uploading image to bucket
        const { data, error } = await supabase.storage
          .from("bun-chat-app-bucket")
          .upload(fileName, avatar);
        if (error) {
          console.error("Error uploading avatar:", error);
          return null;
        }

        // retrieving image's public url after uploading to bucket
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("bun-chat-app-bucket")
          .getPublicUrl(data.path);

        updatedUser = { ...updatedUser, image_url: publicUrl };
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
        password: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        avatar: t.Optional(t.Union([t.File(), t.String()])),
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
        .or(`invitor.eq.${id}, invited.eq.${id}`)
        .eq("accepted", true);
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
  )

  .get(
    "/:id/invitors",
    async ({ params: { id } }) => {
      const { data, error } = await supabase
        .from("friends")
        .select(
          `
          invitorsInfo:users!friends_invitor_fkey(id,name, email, isOnline:is_online, avatar:image_url),
          invitedsInfo:users!friends_invited_fkey(id,name, email, isOnline:is_online, avatar:image_url)
          `
        )
        .eq("invited", id)
        .eq("accepted", false);
      if (error) {
        return {
          status: 500,
          message: error,
        };
      }
      if (data.length === 0) {
        return {
          data,
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
  )
  .post(
    "/:id/friends",
    async ({ params: { id }, body: { invitedId } }) => {
      // checking whether invited id exists
      const { data, error: QUERY_ERROR } = await supabase
        .from("users")
        .select()
        .eq("id", invitedId);
      if (QUERY_ERROR) {
        return {
          status: 500,
          message: "Error checking user id",
        };
      }
      if (data.length === 0) {
        return {
          message: "User not found",
        };
      }

      // creating friend request
      const friendship = {
        invitor: id,
        invited: invitedId,
        accepted: false,
      };
      const { error } = await supabase.from("friends").insert(friendship);
      if (error) {
        return {
          status: 500,
          message:
            "Cannot send friend request. Friend request is already created or requested user is already your friend",
        };
      }
      return {
        status: 201, // invitor will notify invited if status is 201
        message: "Friend request sent",
      };
    },
    {
      body: t.Object({
        invitedId: t.String(),
      }),
    }
  );
