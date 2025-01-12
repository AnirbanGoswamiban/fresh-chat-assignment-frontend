import { NextResponse } from "next/server";
import axios from "axios";

export async function middleware(request) {
  const logStatus = request.cookies.get("isLoggedIn")?.value === "true";
  const userId = request.cookies.get("userId")?.value;

  if (!logStatus || !userId) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // try {
  //   const token = Cookies.get("token");
  //   const userId = Cookies.get("userId")
  //   const response = await axios.post(
  //     `${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/auth/check`,
  //     { userId: userId },
  //     {
  //       headers: {
  //         "Content-Type": "application/json",  
  //         token: `${token}`,  
  //       },
  //     }
  //   );
  //   // console.log(response)
  // } catch (error) {
  //   console.error("Error checking session:", error);
  //   return NextResponse.redirect(new URL("/auth/login", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat", "/dashboard"],
};
