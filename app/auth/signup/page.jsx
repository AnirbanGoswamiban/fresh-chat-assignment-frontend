"use client"
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';  
import axios from "axios";
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleType: "USER",
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
      const response = await signup(formData);
      notifySuccess(response.data.message);
      router.push('/auth/login');
    } catch (error) {
      console.error(error);
      notifyError("failed to signup");
    }
  };

  function verifyEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  //toast functions
  const notifySuccess = (e) => toast.success(e);
  const notifyError = (e) => toast.error(e);

  //axios signup

  async function signup(data) {
    const url = `${process.env.NEXT_PUBLIC_LOCAL_API_PATH}/auth/signup`;
    return axios.post(url, data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          Signup Form
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-black"
            />
          </div>

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

          {/* User Type Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Type
            </label>
            <div className="flex space-x-4 text-black border px-4 py-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="roleType"
                  value="USER"
                  checked={formData.roleType === "USER"}
                  onChange={handleChange}
                  className="mr-2"
                />
                User
              </label>
              <label className="flex items-center text-black">
                <input
                  type="radio"
                  name="roleType"
                  value="COMPANY"
                  checked={formData.roleType === "COMPANY"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Company
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-accent focus:outline-none"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700">
            Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Login</Link>
          </p>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
}
