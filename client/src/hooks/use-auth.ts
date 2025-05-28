import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  const token = localStorage.getItem("auth_token");
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user/profile"],
    enabled: !!token && isInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    queryClient.setQueryData(["/api/user/profile"], userData);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    queryClient.clear();
    window.location.href = "/";
  };

  const isAuthenticated = !!token && !!user;

  return {
    user,
    isLoading: !isInitialized || (!!token && isLoading),
    isAuthenticated,
    error,
    login,
    logout,
  };
}
