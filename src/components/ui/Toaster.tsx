// src/components/ui/Toaster.tsx
import { useToast } from "./use-toast";

export const Toaster = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 right-0 p-4 space-y-2 z-50">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={`p-4 rounded-md shadow-lg text-white ${
            variant === "destructive" ? "bg-red-500" : "bg-gray-800"
          }`}
        >
          <p className="font-bold">{title}</p>
          <p>{description}</p>
        </div>
      ))}
    </div>
  );
};
