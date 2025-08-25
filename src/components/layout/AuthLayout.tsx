import React from "react";

const AuthLayout = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Có thể thêm logo ở đây */}
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center text-neutral-900 mb-6">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
