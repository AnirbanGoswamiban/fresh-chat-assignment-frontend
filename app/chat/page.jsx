"use client"
import { useEffect, useState } from "react";
import ChatWidget from "./components/ChatWidget";
import ChatBox from "./components/ChatBox";
import Navbar from "./components/Navbar";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";

export default function ChatPage() {
  const router = useRouter()
  const [role,setRole] = useState(null)

  useEffect(() => {
    checkUserSession()
    return () => {
      // second
    }
  }, [])

  //checkRole
  const checkUserSession = async () => {
    try {
      const token = Cookies.get("token");
      const userId = Cookies.get("userId")
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/auth/check`,
        { userId: userId },
        {
          headers: {
            "Content-Type": "application/json",  
            token: `${token}`,  
          },
        }
      );
      // console.log(response)
      setRole(response.data.roleType)
    } catch (error) {
      console.error("Error checking session:", error);
      router.push('/auth/login')
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
        <Navbar/>
        {role==="USER"?<ChatWidget/>:null}
        {role==="COMPANY"?<ChatBox/>:null}
    </div>
  );
}
