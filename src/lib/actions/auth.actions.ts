"use server"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong. Please try again." }
      }
    }
    throw error // must re-throw redirect errors
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
