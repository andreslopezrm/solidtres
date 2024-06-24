import { action, cache, redirect } from "@solidjs/router";
import {
  getSession,
  login,
  logout as logoutSession,
  register,
  validatePassword,
  validateUsername
} from "./server";

export const getUser = cache(async () => {
  "use server";
  try {
    const session = await getSession();
    const user = session.data.user;
    if (user === undefined) throw new Error("User not found");
    return user;
  } catch {
    await logoutSession();
    throw redirect("/login");
  }
}, "user");

export const loginOrRegister = action(async (formData: FormData) => {
  "use server";
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const loginType = String(formData.get("loginType"));
  let error = validateUsername(username) || validatePassword(password);
  if (error) return new Error(error);

  try {
    const data = await login(username, password);
    const session = await getSession();
    console.log(data)
   await session.update(d => {
    d.user = data.user
    return d;
   });
  } catch (err) {
    return err as Error;
  }
  return redirect("/");
});

export const logout = action(async () => {
  "use server";
  await logoutSession();
  return redirect("/login");
});
