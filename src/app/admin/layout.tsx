'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminProvider } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import BetterProtectedAdmin from '@/components/admin/BetterProtectedAdmin';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't apply protection to the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  // Apply protection to all other admin routes
  return (
    <BetterProtectedAdmin>
      <AdminProvider>
        <AdminLayout>
          {children}
        </AdminLayout>
      </AdminProvider>
    </BetterProtectedAdmin>
  );
}