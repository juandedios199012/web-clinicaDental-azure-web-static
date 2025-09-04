import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  navigation: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navigation }) => {
  return (
    <div className="w-64 bg-white border-r border-neutral-200 h-full">
      <nav className="mt-8 px-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                  : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
              }`
            }
          >
            <item.icon 
              className={`mr-3 h-5 w-5 flex-shrink-0`}
              aria-hidden="true" 
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
