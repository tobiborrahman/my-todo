'use client';

import { useState } from 'react';
import Button from './Button';
import { Bell, CalendarDays } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  onNewTask?: () => void;
  showNewTaskButton?: boolean;
}

export default function Header({ onNewTask, showNewTaskButton = true }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
  
    return {
      dayName: days[today.getDay()],
      date: today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };
  };

  const { dayName, date } = getCurrentDate();
  

  return (
    <header className="bg-white border-b border-gray-200 px-[69.5px] py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
          />
        </div>

        {/* Right Side Icons and Button */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            className="w-10 h-10 bg-[#5272FF] rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5 text-white" />
          </button>

          {/* Calendar/Grid Icon */}
          <button className="w-10 h-10 bg-[#5272FF] rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
            <CalendarDays className="w-5 h-5 text-white" />
          </button>

          {/* Date */}
          <div className="flex flex-col leading-tight text-[#0D224A]">
    <p className="text-[15px]">{dayName}</p>
    <p className="text-[15px]">{date}</p>
  </div>
        </div>
      </div>
    </header>
  );
}

