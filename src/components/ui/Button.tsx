// src/components/ui/Button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const variants = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  // SỬA LỖI: Thêm các class dark: vào đây
  outline:
    "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700",
  ghost: "hover:bg-gray-100 dark:hover:bg-gray-700",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
