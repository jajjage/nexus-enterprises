export const ADMIN_SESSION_COOKIE = "nexus_admin_session";

type AdminAuthConfig = {
  email: string;
  password: string;
  sessionSecret: string;
};

function clean(value: string | undefined) {
  return (value ?? "").trim();
}

export function getAdminAuthConfig(): AdminAuthConfig | null {
  const email = clean(process.env.ADMIN_LOGIN_EMAIL).toLowerCase();
  const password = clean(process.env.ADMIN_LOGIN_PASSWORD);
  const sessionSecret = clean(process.env.ADMIN_SESSION_SECRET);

  if (!email || !password || !sessionSecret) {
    return null;
  }

  return { email, password, sessionSecret };
}

export function isValidAdminCredentials(email: string, password: string) {
  const config = getAdminAuthConfig();
  if (!config) return false;

  return email.toLowerCase().trim() === config.email && password === config.password;
}
