import React from 'react';

interface NavItemProps {
  label: string;
  Icon: React.ElementType; // Allows passing an icon component like one from lucide-react
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, Icon, active, danger, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 text-left
        ${
          active
            ? "bg-blue-100 text-blue-700 font-semibold" // Active state styles
            : danger
            ? "text-red-600 hover:bg-red-100 hover:text-red-700" // Danger state styles
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900" // Default state styles
        }
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {label}
    </button>
  );
};

export default NavItem;