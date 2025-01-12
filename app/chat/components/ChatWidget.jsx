"use client";
import { useState, useEffect, use } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";
import clientSocket from "@/socket/socket";

export default function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [CompanyId] = useState(`${process.env.NEXT_PUBLIC_COMPANY_ID}`); // Fixed receiver ID
  const [userId, setUserId] = useState(Cookies.get("userId")); // Sender ID fetched from cookies

  // useEffect to fetch name and email from cookies on page load
  useEffect(() => {
    createConnection(userId,CompanyId)
    const storedUserId = Cookies.get("userId");
    const userName = Cookies.get("name");
    const email = Cookies.get("email");
    const token = Cookies.get("token");

    if (storedUserId && token) {
      setUserId(storedUserId);

      // Set name and email in formData
      setFormData({
        name: userName || "",
        email: email || "",
      });

      // Fetch previous messages
      fetchMessages(storedUserId, token);
    } else {
      console.error("User ID or token not found in cookies.");
    }
  }, []);

  useEffect(() => {
    const emitOnlineStatus = (senderId=userId, receiverId=CompanyId) => {
      if (!senderId || !receiverId) {
        console.error("Invalid senderId or receiverId");
        return;
      }
      
      // Emit the 'online' event to the server
      clientSocket.emit("online", { senderId, receiverId });
    
      console.log(`Emitted 'online' event for senderId: ${senderId} and receiverId: ${receiverId}`);
    };
    clientSocket.on('joined', emitOnlineStatus);
  
    return () => {
      clientSocket.off('joined',emitOnlineStatus)
    }
  }, [clientSocket])
  



  const fetchMessages = async (storedUserId, token) => {
    try {
      // redis response
      let redisData =[]
      let formattedDbData = []
      const redisResponse = await fetch(
        `${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/chat/getFromRedis?userId=${storedUserId}`,
        {
          headers: {
            token: `${token}`, // Include token in headers
          },
        }
      );
  
       redisData = await redisResponse.json();
      console.log("Redis Response:", redisData);

      if (redisData.type === "success" && redisData.data.length > 0) {
        // console.log("REDIS DATA",redisData.data)
        redisData=redisData.data
      }else{
        redisData=[]
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/chat/getBothSideMessage?user1=${storedUserId}&user2=${CompanyId}`,
        {
          headers: {
            token: `${token}`, // Include token in headers
          },
        }
      );
      const data = await response.json();
      if (data.type === "success") {
         formattedDbData = data.data.map((msg) => ({
          ...msg,
          type: msg.sender === storedUserId ? "outgoing" : "incoming",
        }));
        setMessages([...messages,...formattedDbData,...redisData]);
      } else {
        console.error("Failed to fetch messages:", data.message);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const saveMessages = async (newMessages) => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/chat/savemessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: `${token}`, // Include token in headers
        },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();
      if (data.type !== "success") {
        console.error("Failed to save messages:", data.message);
      }
    } catch (err) {
      console.error("Error saving messages:", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && userId) {
      const newMessages = [
        ...messages,
        {
          sender: userId,
          receiver: CompanyId,
          message: newMessage,
          timestamp: new Date(),
        },
      ];
      //emit it to socket
      const messageObj = {
        senderId: userId,
        receiverId: CompanyId,
        message: newMessage,
      };

      clientSocket.emit("sendMessage", messageObj, (response) => {
        if (response.status === "success") {
          console.log("Message successfully delivered:", response.message);
        } else {
          console.error("Failed to deliver message:", response.message);
        }
      });
      setMessages(newMessages);
      setNewMessage("");
      // saveMessages([{ sender: userId, receiver: CompanyId, message: newMessage }]);
    }
  };

  // create connection
  const createConnection = async (userId, CompanyId) => {
    try {
      let token = Cookies.get("token")
      const response = await axios.post(`${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/connection/create`, 
        {
          userId:userId,
          connectionId:CompanyId,
        }
        ,
        {
          headers: {
            "Content-Type": "application/json",  
            token: `${token}`,  
          },
        }
      );
    } catch (error) {
      console.error("Error while creating connection:", error);
      router.push('/auth/login')
    }
  };

  return (
<div className="fixed bottom-4 right-4 text-black">
  {!isOpen ? (
    <button
      onClick={() => setIsOpen(true)}
      className="bg-primary text-white p-4 rounded-full shadow-md"
    >
      Chat
    </button>
  ) : (
    <div className="bg-white rounded-lg shadow-md p-4" style={{ height: "90vh", width: "50vw" }}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">Chat</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-600 hover:text-black text-lg"
        >
          ✕
        </button>
      </div>
      <div className="h-[75%] overflow-y-scroll border rounded-md p-2 flex flex-col">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-2 ${
              msg.sender === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-md w-[50%] ${
                msg.sender === userId ? "bg-blue-100 text-right" : "bg-gray-100 text-left"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="mt-2 space-y-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none"
        />
        <button type="submit" className="w-full bg-primary text-white py-2 rounded-md">
          Send
        </button>
      </form>
    </div>
  )}
</div>
  );
}
