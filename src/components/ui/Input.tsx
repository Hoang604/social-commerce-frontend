import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        // Thêm các class dark: vào đây
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm
                    placeholder:text-gray-400 
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 
                    disabled:cursor-not-allowed disabled:opacity-50
                    dark:border-gray-600 dark:text-gray-50 dark:focus-visible:ring-blue-400
                    ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
