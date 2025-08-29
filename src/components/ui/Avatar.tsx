// src/components/ui/Avatar.tsx
import React from "react";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
}

/**
 * Lấy hai chữ cái đầu từ tên
 * Ví dụ: "Đinh Việt Hoàng" -> "ĐH"
 */
const getInitials = (name: string): string => {
  const nameParts = name.trim().split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  className = "",
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "User Avatar"}
        className={`w-10 h-10 rounded-full object-cover ${className}`}
      />
    );
  }

  const initials = name ? getInitials(name) : "?";

  return (
    <div
      className={`w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
    >
      <span className="font-semibold text-gray-600 dark:text-gray-300">
        {initials}
      </span>
    </div>
  );
};
