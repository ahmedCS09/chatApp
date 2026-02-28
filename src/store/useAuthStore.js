import { create } from "zustand";

const useAuthStore = create((set) => ({
    user: null,
    authLoading: true,
    setUser: (userData) => set({ user: userData, authLoading: false }),
    clearUser: () => set({ user: null, authLoading: false }),
    isLoggedIn: () => !!set.getState().user,

    isMobileMenuOpen: false,
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
}));

export default useAuthStore;