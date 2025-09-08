import React from "react";
import { cn } from "../../lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
}

const getInitials = (name: string): string => {
  if (!name) return "?";
  const nameParts = name.trim().split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, name, className = "" }, ref) => {
    // SỬA LỖI: Định nghĩa các lớp mặc định, sau đó dùng cn để kết hợp
    const defaultClasses =
      "w-10 h-10 rounded-full object-cover bg-muted flex items-center justify-center";
    const combinedClasses = cn(defaultClasses, className); // <-- Kết hợp các lớp

    if (src) {
      return (
        <img
          src={src}
          alt={name || "User Avatar"}
          className={combinedClasses} // <-- Áp dụng các lớp đã kết hợp
        />
      );
    }

    const initials = name ? getInitials(name) : "?";

    return (
      <div
        ref={ref}
        className={combinedClasses} // <-- Áp dụng các lớp đã kết hợp
      >
        <span className="font-semibold text-muted-foreground">{initials}</span>
      </div>
    );
  }
);
