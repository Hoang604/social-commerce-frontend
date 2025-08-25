/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
        },
        neutral: {
          900: "#111827",
          600: "#4B5563",
          400: "#9CA3AF",
          200: "#E5E7EB",
          100: "#F3F4F6",
        },
        feedback: {
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#0EA5E9",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
