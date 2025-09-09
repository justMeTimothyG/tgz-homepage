"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut as authSignOut } from '@/lib/auth-client';
import type { User, Session } from '@/lib/auth-client';

export interface BetterAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const BetterAuthContext = createContext<BetterAuthContextType | undefined>(undefined);

interface BetterAuthProviderProps {
  children: ReactNode;
}

export function BetterAuthProvider({ children }: BetterAuthProviderProps) {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await authSignOut();
  };

  const value: BetterAuthContextType = {
    user: session?.user || null,
    session: session || null,
    isLoading: isPending,
    signOut: handleSignOut,
  };

  return (
    <BetterAuthContext.Provider value={value}>
      {children}
    </BetterAuthContext.Provider>
  );
}

export function useBetterAuth() {
  const context = useContext(BetterAuthContext);
  if (context === undefined) {
    throw new Error('useBetterAuth must be used within a BetterAuthProvider');
  }
  return context;
}