import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import clientSocket from "../../../socket/socket";
import UserList from "./UserList";

export default function ChatBox() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    // Get user connections
    getConnections(Cookies.get("userId"));

    // Emit 'online' status for the current user
    clientSocket.emit("online", { senderId: Cookies.get("userId") });

    // Listen to socket events
    clientSocket.on("userStatus", handleUserStatusUpdate);
    clientSocket.on("lastMessage", handleLastMessageUpdate);

    // Cleanup on component unmount
    return () => {
      clientSocket.emit("offline", { senderId: Cookies.get("userId") });
      clientSocket.off("userStatus", handleUserStatusUpdate);
      clientSocket.off("lastMessage", handleLastMessageUpdate);
    };
  }, []);

  useEffect(() => {
    // Fetch messages when activeUser changes
    if (activeUser) {
      const storedUserId = Cookies.get("userId");
      const token = Cookies.get("token");
      fetchMessages(activeUser.userId._id, token);
    }
  }, [activeUser]);

  // Fetch connections (users) from the API
  const getConnections = async (userId) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/connection/list?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            token: `${token}`,
          },
        }
      );
      setUsers(response.data.data);
      if (response.data.data.length > 0) {
        setActiveUser(response.data.data[0]); // Set first user as active user
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      router.push("/auth/login");
    }
  };

  // Fetch messages for the active user
  const fetchMessages = async (storedUserId, token) => {
    try {
      let redisData = [];
      let formattedDbData = [];

      // Fetch from Redis
      const redisResponse = await fetch(
        `${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/chat/getFromRedis?userId=${storedUserId}`,
        {
          headers: {
            token: `${token}`, // Include token in headers
          },
        }
      );

      const redisResult = await redisResponse.json();
      if (redisResult.type === "success" && redisResult.data.length > 0) {
        // redisData = redisResult.data;
        redisData = redisResult.data.map((message) => ({
          ...message,
          type: message.type === "outgoing" ? "incoming" : "outgoing",
        }));
      }

      // Fetch from database
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/chat/getBothSideMessage?user1=${storedUserId}&user2=${activeUser.userId._id}`,
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
        setMessages([])
        setMessages([...formattedDbData,...redisData]);
      } else {
        console.error("Failed to fetch messages:", data.message);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Handle status updates via socket
  const handleUserStatusUpdate = ({ userId, status }) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.userId === userId ? { ...user, status } : user
      )
    );
  };

  // Handle last message updates via socket
  const handleLastMessageUpdate = ({ userId, message }) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.userId === userId ? { ...user, lastMessage: message } : user
      )
    );
  };

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeUser) return;

    const newMessage = { message: input, sender: "user",type:"outgoing", timestamp: new Date() };
    setMessages([...messages, newMessage]);
    setInput("");

    clientSocket.emit("sendMessage", {
      senderId: Cookies.get("userId"),
      receiverId: activeUser.userId._id,
      message: input,
    });
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-y-scroll bg-gray-100 text-black">
      {/* Left Sidebar */}
      <UserList
        users={users}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
      />

      {/* Chat Area */}
      <div className="flex flex-col w-3/4 h-full bg-white shadow-md">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">
            Chat with {activeUser?.userId?.name || "Select a User"}
          </h2>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === "outgoing" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2 rounded-lg max-w-xs ${
                  msg.type === "outgoing" ? "bg-primary text-white" : "bg-gray-200 text-black"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="flex p-4 space-x-2 border-t">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow px-3 py-2 border rounded-md"
            placeholder={`Type a message to ${activeUser?.userId?.name || "Select a User"}...`}
          />
          <button
            onClick={handleSendMessage}
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
