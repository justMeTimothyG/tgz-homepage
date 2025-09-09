"use client";

import React from 'react';
import AdminSidebar from './AdminSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import BetterLogoutButton from './BetterLogoutButton';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 transition-all duration-300 ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Admin Panel
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <BetterLogoutButton />
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}