import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { cn } from "../../lib/utils";

const DropdownMenu = ({ children }: { children: React.ReactNode }) => (
  <Menu as="div" className="relative inline-block text-left">
    {children}
  </Menu>
);

const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => (
  <Menu.Button as={Fragment}>{children}</Menu.Button>
);

const DropdownMenuContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    <Menu.Items
      className={cn(
        "absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-popover text-popover-foreground shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border",
        className
      )}
    >
      <div className="py-1">{children}</div>
    </Menu.Items>
  </Transition>
);

const DropdownMenuItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Menu.Item>
    {({ active }) => (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left block px-4 py-2 text-sm",
          active ? "bg-accent text-accent-foreground" : ""
        )}
      >
        {children}
      </button>
    )}
  </Menu.Item>
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
