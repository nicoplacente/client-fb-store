import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { envConfig } from "./config";


async function verifyJWT(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    return await jwtVerify(token, secret);
  } catch (err) {
    return null;
  }
}

export async function middleware(request) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isAccessValid = accessToken ? await verifyJWT(accessToken) : null;

  if (isAccessValid) {
    return NextResponse.next();
  }

  if (refreshToken) {
    const isRefreshValid = await verifyJWT(refreshToken);
    if (isRefreshValid) {
      try {
        const res = await fetch(`${envConfig.API_REFRESH_TOKEN}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (res.ok) {
          const data = await res.json();

          const response = NextResponse.next();
          response.cookies.set("accessToken", data.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
          });

          return response;
        }
      } catch (err) {
        console.error("Error al refrescar token:", err);
      }
    }
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  return response;
}

export const config = {
  matcher: ["/profile/:path*", "/profile"],
};
