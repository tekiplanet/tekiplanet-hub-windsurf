import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Briefcase 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboardOrHome = location.pathname === '/dashboard' || location.pathname === '/home';

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    console.log('Logged out');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center ml-auto space-x-4">
        {!isDashboardOrHome && (
          <button
            onClick={handleBack}
            className="text-gray-700 hover:text-primary transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {isDashboardOrHome && (
          <button className="text-gray-700 hover:text-primary transition-colors duration-200">
            <Bell className="h-5 w-5" />
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <User className="h-5 w-5 text-gray-700 hover:text-primary cursor-pointer transition-colors duration-200" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-white shadow-lg rounded-md p-2 mt-2 w-44 border border-gray-200 z-50"
            sideOffset={5}
            align="end"
          >
            <DropdownMenuItem
              className="flex items-center p-2 hover:bg-primary hover:text-white cursor-pointer rounded-sm transition-colors duration-200 focus:outline-none text-sm"
              onClick={() => navigate('/dashboard/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center p-2 hover:bg-primary hover:text-white cursor-pointer rounded-sm transition-colors duration-200 focus:outline-none text-sm"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              <span>Services</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center p-2 hover:bg-primary hover:text-white cursor-pointer rounded-sm transition-colors duration-200 focus:outline-none text-sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center p-2 hover:bg-primary hover:text-white cursor-pointer rounded-sm transition-colors duration-200 focus:outline-none text-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;