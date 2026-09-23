import type { Metadata } from "next";
import LoginSection from "./section/LoginSection";

export const metadata: Metadata = {
  title: "Log in",
};

/**
 * Entry point halaman login Spotify — setipis mungkin; pesan error alur
 * OAuth dikirim lewat query ?auth_error=... oleh route handler auth.
 */
export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { auth_error: authError, origin } = await searchParams;
  const error = Array.isArray(authError) ? authError[0] : authError;
  const originValue = Array.isArray(origin) ? origin[0] : origin;

  return <LoginSection authError={error} origin={originValue} />;
}
