"use client";
import { getUserFromToken } from "@/lib/jwt";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const AppContext = createContext<any>(undefined);

export function AppWrapper({ children }: { children: React.ReactNode }) {
  let [user, setUser] = useState(getUserFromToken());
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = sessionStorage.getItem('token');
      if (!token) { return }

      try {
        const _ = await refreshToken(token);
      } catch (error) {
        console.error('Error refreshing token');
      }
    }, 15 * 60 * 1000); // هر 15 دقیقه

    return () => clearInterval(interval);
  }, []);

  const refreshToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
      });

      if (response.ok) {
        token = await response.json();
        sessionStorage.setItem('token', token);
      }
    } catch (error: any) {
      sessionStorage.removeItem('token');
      toast('session expired, login again');
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}


export function useAppContext() {
  return useContext(AppContext);
}
