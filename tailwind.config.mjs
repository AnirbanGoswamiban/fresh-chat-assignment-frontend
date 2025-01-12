/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#4CAF50", // Replace with color from the PDF
        secondary: "#F5F5F5", // Replace with color from the PDF
        accent: "#FF9800", // Replace with color from the PDF
      },
    },
  },
  plugins: [],
};
