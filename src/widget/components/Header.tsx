// src/widget/components/Header.tsx
interface HeaderProps {
  onClose: () => void;
  primaryColor: string;
}

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const Header = ({ onClose, primaryColor }: HeaderProps) => {
  return (
    <div
      style={{ backgroundColor: primaryColor }}
      className="p-4 text-white flex justify-between items-center rounded-t-lg"
    >
      <h3 className="font-bold text-lg">Chat with us</h3>
      <button onClick={onClose} className="hover:opacity-75">
        <CloseIcon />
      </button>
    </div>
  );
};
