"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from 'react-toastify';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Retrieve the email from cookies
      const emailCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("email="));
      const email = emailCookie ? emailCookie.split("=")[1] : null;

      if (!email) {
        throw new Error("No email found in cookies.");
      }

      // Call the logout API
      const response = await axios.post(`${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/auth/logout`, {
        email,
      });

      if (response.data.type === "success") {
        // Clear cookies after successful logout
        document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "roleType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";



        // Notify user of successful logout
        toast.success("Logged out successfully.");

        // Redirect to the login page
        router.push("/auth/login");
      } else {
        toast.error("Logout failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("An error occurred during logout. Please try again.");
    }
  };

  return (
    <nav className="bg-primary text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Left: Logo */}
        <div>
          <h1 className="text-xl font-bold">My App</h1>
        </div>

        {/* Right: Logout Button */}
        <div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
