import { cookies } from "next/headers";

const AFFILIATE_COOKIE = "agury_ref";

export async function setAffiliateCookie(code: string) {
  const cookieStore = await cookies();
  const days = parseInt(process.env.AFFILIATE_COOKIE_DAYS || "30", 10);
  
  cookieStore.set(AFFILIATE_COOKIE, code, {
    path: "/",
    maxAge: 60 * 60 * 24 * days,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Lax to allow cross-site navigation to set it initially
  });
}

export async function getAffiliateCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(AFFILIATE_COOKIE)?.value;
}

export async function clearAffiliateCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AFFILIATE_COOKIE);
}
