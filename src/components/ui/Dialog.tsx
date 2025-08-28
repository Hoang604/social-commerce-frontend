// src/components/ui/Dialog.tsx
import React from "react";

// A simple context to manage dialog state if needed, though for this implementation we use props.
const DialogContext = React.createContext<{
  onOpenChange: (open: boolean) => void;
}>({ onOpenChange: () => {} });

// Main Dialog component to wrap everything
export const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;

  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
        onClick={() => onOpenChange(false)}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the content
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
};

// Dialog Content
export const DialogContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-6">{children}</div>;
};

// Dialog Header
export const DialogHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};

// Dialog Title
export const DialogTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
      {children}
    </h2>
  );
};

// Dialog Description
export const DialogDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{children}</p>
  );
};

// Dialog Footer
export const DialogFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`flex justify-end space-x-2 mt-6 ${className || ""}`}>
      {children}
    </div>
  );
};
