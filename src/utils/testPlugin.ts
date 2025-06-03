import Elysia from "elysia";
import supabase from "./database";

export default function testPlugin() {
  return new Elysia({
    prefix: "/test",
  }).get("/users", async () => {
    const usersData = await supabase.from("users").select();
    console.log(usersData);
  });
}
