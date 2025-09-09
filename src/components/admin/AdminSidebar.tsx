"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  FileText, 
  Plus, 
  List,
  Home,
  Tag
} from 'lucide-react';

export default function AdminSidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      id: 'posts',
      icon: List,
      label: 'All Posts',
      href: '/admin/posts'
    },
    {
      id: 'create',
      icon: Plus,
      label: 'New Post',
      href: '/admin/posts/new'
    },
    {
      id: 'tags',
      icon: Tag,
      label: 'Tags',
      href: '/admin/tags'
    },
    {
      id: 'home',
      icon: Home,
      label: 'View Site',
      href: '/',
      external: true
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 w-64`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              Blog Admin
            </span>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.id === 'posts' && pathname === '/admin') ||
            (item.id === 'posts' && pathname.startsWith('/admin/posts') && pathname !== '/admin/posts/new');
          
          if (item.external) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Icon className={`w-5 h-5 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </a>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapsed tooltip overlay */}
      {sidebarCollapsed && (
        <div className="absolute top-0 left-16 w-0 h-full pointer-events-none">
          {/* Tooltip implementation can be added here if needed */}
        </div>
      )}
    </div>
  );
}