"use client"
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';  
import axios from "axios";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verifyEmail(formData.email)) {
      notifyError("Please enter a valid email address.");
      return;
    }
    try {
      const response = await login(formData);
      const data = response.data;
      
      // Set cookies
      document.cookie = `token=${data.token}; path=/;`; // Set token cookie
      document.cookie = `userId=${data.id}; path=/;`;
      document.cookie = `name=${data.name}; path=/;`;
      document.cookie = `email=${data.email}; path=/;`;
      document.cookie = `roleType=${data.roleType}; path=/;`;
      document.cookie = `isLoggedIn=${data.isLoggedIn}; path=/;`;

      notifySuccess("Login successful: " + data.message);
      router.push('/chat');
    } catch (error) {
      console.error("Error during login:", error);
      notifyError("Login failed. Please try again.");
    }
  };

  function verifyEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  //toast functions
  const notifySuccess = (e) => toast.success(e);
  const notifyError = (e) => toast.error(e);

  //axios login

  async function login(data) {
    const url = `${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/auth/login`;
    return axios.post(url, data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          Login Form
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-accent focus:outline-none"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700">
            Don&apos;t have an account? <Link href="/auth/signup" className="text-primary hover:underline">Create New Account</Link>
          </p>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
}
