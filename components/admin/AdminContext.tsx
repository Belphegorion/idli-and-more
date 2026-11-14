'use client';

import React, { createContext, useContext } from 'react';

export interface AdminUser {
  role: 'owner' | 'staff';
  email: string;
  name: string;
}

export interface AdminContextType {
  user: AdminUser | null;
  userRole: 'owner' | 'staff';
  userName: string;
  userEmail: string;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  onOpenMobileSidebar: () => void;
}

const AdminContext = createContext<AdminContextType>({
  user: null,
  userRole: 'owner',
  userName: 'Admin',
  userEmail: '',
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},
  onOpenMobileSidebar: () => {},
});

export function AdminProvider({
  children,
  user,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}: {
  children: React.ReactNode;
  user: AdminUser | null;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}) {
  const value: AdminContextType = {
    user,
    userRole: user?.role || 'owner',
    userName: user?.name || 'Admin',
    userEmail: user?.email || '',
    mobileSidebarOpen,
    setMobileSidebarOpen,
    onOpenMobileSidebar: () => setMobileSidebarOpen(true),
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext() {
  return useContext(AdminContext);
}
