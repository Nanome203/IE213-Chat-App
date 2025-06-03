import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  hoverItemBgColor?: string;
  hoverItemTextColor?: string;
}

interface MenuDropdownProps {
  items?: MenuItem[];
  customContent?: () => React.ReactNode;
  triggerIcon?: React.ReactNode; // ✅ optional custom trigger icon
  iconColor?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  menuBgColor?: string;
  menuTextColor?: string;
  itemHoverColor?: string;
}

const positionClasses = {
  'bottom-right': 'origin-top-right right-0 top-full mt-2',
  'bottom-left': 'origin-top-left left-0 top-full mt-2',
  'top-right': 'origin-bottom-right right-0 bottom-full mb-2',
  'top-left': 'origin-bottom-left left-0 bottom-full mb-2',
};

const MenuDropdown: React.FC<MenuDropdownProps> = ({
  items,
  customContent,
  triggerIcon,
  iconColor = 'fill-white',
  position = 'bottom-right',
  menuBgColor = 'bg-base-100',
  menuTextColor = 'text-black',
  itemHoverColor = 'hover:bg-black-600 hover:text-white',
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Toggle button */}
      {triggerIcon ? (
        <button
          onClick={() => setOpen(!open)}
          className="btn btn-circle bg-transparent border-none shadow-none"
        >
          {triggerIcon}
        </button>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className={`btn btn-circle bg-transparent border-none shadow-none transition-transform duration-300 ${open ? "rotate-[-90deg]" : ""
            }`}
        >
          <div className="relative w-6 h-6">
            <svg
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"
                } ${iconColor}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
            </svg>

            <svg
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${open ? "opacity-0" : "opacity-100"
                } ${iconColor}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
            </svg>
          </div>
        </button>
      )}
      {/* Dropdown content */}
      {/* {open && (
        <ul
          className={clsx(
            "absolute z-50 w-52 p-2 rounded-box shadow bg-black/50 space-y-1 transition-all duration-200 scale-95 ",
            positionClasses[position]
          )}
        >
          {items.map((item, index) => (
            <li key={index}>
              <a
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-[#6a5dad] rounded text-sm cursor-pointer"
              >
                {item.icon && <span className="">{item.icon}</span>}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )} */}
      {/* ✅ Dropdown content */}
      {open && (
        <div
          className={`absolute z-50 w-64 p-3 rounded-box shadow bg-base-100 space-y-2 ${positionClasses[position]} ${menuBgColor} ${menuTextColor}`} >
          {customContent ? (
            customContent()
          ) : (
            <ul className="space-y-1">
              {items?.map((item, index) => (
                <li key={index}>
                  <a
                    onClick={() => {
                      setOpen(false);
                      item.onClick();
                    }}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer',
                      itemHoverColor
                    )}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;
