import {create} from 'zustand';


interface AuthState {
    isLoggedIn: boolean;
    isRefreshing: boolean; // <-- Add this
    setLoggedIn: (isLoggedIn: boolean) => void;
    setIsRefreshing: (isRefreshing: boolean) => void; // <-- Add this
  }
  
  export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    isRefreshing: false, // <-- Initialize here
    setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
    setIsRefreshing: (isRefreshing) => set({ isRefreshing }), // <-- Add setter
  }));