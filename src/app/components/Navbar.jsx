"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore.js';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { Home, Users, MessageCircle, LogOut, LogIn } from 'lucide-react';
import { io } from "socket.io-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearUser, setUser, isMobileMenuOpen, toggleMobileMenu, authLoading } = useAuthStore();
    const socketRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const queryClient = useQueryClient();

    const isDashboardPage = pathname === '/auth/dashboardPage';
    const isLoginRegisterPage =
        pathname === '/auth/loginPage' || pathname === '/auth/registerPage';
    const isLandingPage = pathname === '/';

    const handleLogout = async () => {
        try {
            const res = await axios.post('/api/auth/logout');
            if (res.status === 200) {
                clearUser();
                router.push('/auth/loginPage');
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        setMounted(true);
        const fetchUser = async () => {
            try {
                const res = await axios.get('/api/auth/getUser');
                if (res.data.user) {
                    setUser(res.data.user);
                }
            } catch {
                clearUser();
            }
        };
        fetchUser();
    }, [setUser]);

    useEffect(() => {
        if (!user || user.role === 'admin') return;
        const fetchNotifications = async () => {
            const res = await axios.get("/api/friendRequest/getUnreadNotifications");
            if (res.data) console.log("Unread notifications:", res.data.length);
        };

        fetchNotifications();
    }, [user]);

    // Socket Connection for Global Events
    useEffect(() => {
        if (!user?._id) return;

        console.log("[NAVBAR] Connecting socket to:", process.env.NEXT_PUBLIC_SOCKET_URL);
        console.log("[NAVBAR] User ID:", user._id);
        const isAdmin = user.role === 'admin';

        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
            path: "/api/socket/io",
            transports: ["websocket"],
        });

        socketRef.current.on("connect", () => {
            console.log("✅ [SOCKET] Connected:", socketRef.current.id);
            console.log("[SOCKET] Joining room:", user._id);
            socketRef.current.emit("join", user._id);
        });

        socketRef.current.on("connect_error", (error) => {
            console.error("❌ [SOCKET] Connection Error:", error);
        });

        if (!isAdmin) {
            socketRef.current.on("newMessage", (data) => {
                console.log("🔔 [SOCKET] newMessage received:", data);
                toast.success(`${data.senderName || "New Message"}`, {
                    description: data.message,
                    duration: 5000,
                });
                queryClient.invalidateQueries({ queryKey: ["friends"] });
                queryClient.invalidateQueries({ queryKey: ["messages", data.sender] });
            });

            socketRef.current.on("reqAcceptedNotification", async (data) => {
                toast.success("Your friend request was accepted!");
                queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
                queryClient.invalidateQueries({ queryKey: ["users"] });
                queryClient.invalidateQueries({ queryKey: ["friends"] });
                try {
                    await axios.post("/api/friendRequest/markNotificationAsRead", {
                        notificationId: data?.notificationId
                    });
                } catch (err) {
                    console.error("Error marking notification:", err);
                }
            });

            socketRef.current.on("friendRequest", (data) => {
                queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
                queryClient.refetchQueries({ queryKey: ["pendingRequests"], type: "active" });
                queryClient.invalidateQueries({ queryKey: ["users"] });

                toast(`${data.senderName} sent you a friend request!`, {
                    description: "Do you want to accept?",
                    action: {
                        label: "Accept",
                        onClick: async () => {
                            try {
                                await axios.post("/api/friendRequest/acceptRequest", { requestId: data.requestId });
                                toast.success(`${data.senderName} is now your friend`);
                                queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
                                queryClient.invalidateQueries({ queryKey: ["users"] });
                                queryClient.invalidateQueries({ queryKey: ["friends"] });
                            } catch (error) { toast.error("Failed to accept request"); }
                        },
                    },
                    cancel: {
                        label: "Dismiss",
                        onClick: async () => {
                            try {
                                await axios.post("/api/friendRequest/removeFriend", { requestId: data.requestId });
                                toast.info("Friend request dismissed");
                                queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
                                queryClient.invalidateQueries({ queryKey: ["users"] });
                            } catch (error) { toast.error("Failed to dismiss request"); }
                        },
                    },
                    duration: 8000,
                });
            });

            socketRef.current.on("friendRemoved", (data) => {
                queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
                queryClient.invalidateQueries({ queryKey: ["users"] });
            });
        }

        return () => {
            if (socketRef.current) {
                console.log("[NAVBAR] Disconnecting socket");
                socketRef.current.disconnect();
            }
        };
    }, [user?._id, queryClient]);

    // return null or skeleton if not mounted to prevent hydration mismatch
    if (!mounted) return null;

    return (
        <nav className="absolute top-0 left-0 w-full z-[1000] bg-slate-950/80 backdrop-blur-md border-b border-white/5 shadow-sm px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="Chatty" className="h-10 w-auto object-contain hover:scale-105 transition-transform" />
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    {!isLoginRegisterPage && !isLandingPage && (
                        <div className="flex items-center gap-2">
                            <NavLink href="/auth/dashboardPage" currentPath={pathname} icon={<Home className="w-5 h-5" />} label="Dashboard" />
                            {user?.role !== 'admin' && (
                                <>
                                    <NavLink href="/friends/renderFriendsPage" currentPath={pathname} icon={<Users className="w-5 h-5" />} label="Friends" />
                                    <NavLink href="/chat/chatPage" currentPath={pathname} icon={<MessageCircle className="w-5 h-5" />} label="Chat" />
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4 border-l border-slate-800 pl-6 ml-2">
                        {user ? (
                            <>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                                {isDashboardPage && (
                                    <Link href="/auth/profilePage" className="hover:ring-2 ring-blue-500 p-0.5 rounded-full transition-all">
                                        <ProfileIcon user={user} />
                                    </Link>
                                )}
                            </>
                        ) : (
                            !isLoginRegisterPage && !authLoading && (
                                <Link
                                    href="/auth/loginPage"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95 font-medium"
                                >
                                    <LogIn className="w-5 h-5" />
                                    <span>Login</span>
                                </Link>
                            )
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 text-slate-400 hover:bg-slate-900 rounded-lg transition-colors"
                >
                    <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 shadow-xl overflow-hidden animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col p-4 gap-2">
                        {!user && !isLoginRegisterPage && !authLoading && (
                            <MobileNavLink href="/auth/loginPage" onClick={toggleMobileMenu} icon={<LogIn className="w-5 h-5" />} label="Login" />
                        )}

                        {!isLoginRegisterPage && !isLandingPage && (
                            <>
                                <MobileNavLink href="/auth/dashboardPage" onClick={toggleMobileMenu} icon={<Home className="w-5 h-5" />} label="Dashboard" />
                                {user?.role !== 'admin' && (
                                    <>
                                        <MobileNavLink href="/friends/renderFriendsPage" onClick={toggleMobileMenu} icon={<Users className="w-5 h-5" />} label="Friends" />
                                        <MobileNavLink href="/chat/chatPage" onClick={toggleMobileMenu} icon={<MessageCircle className="w-5 h-5" />} label="Chat" />
                                    </>
                                )}
                            </>
                        )}

                        {user && (
                            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
                                <Link
                                    href="/auth/profilePage"
                                    className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 font-medium"
                                    onClick={toggleMobileMenu}
                                >
                                    <ProfileIconSmall user={user} />
                                    Profile
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); toggleMobileMenu(); }}
                                    className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors font-medium w-full text-left"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

// Sub-components for cleaner code
const NavLink = ({ href, currentPath, icon, label }) => {
    const isActive = currentPath === href;
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive
                ? "bg-indigo-600/20 text-indigo-400 shadow-sm"
                : "text-slate-400 hover:bg-slate-900 hover:text-indigo-400"
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

const MobileNavLink = ({ href, icon, label, onClick }) => (
    <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 font-medium"
    >
        <div className="text-indigo-400">{icon}</div>
        {label}
    </Link>
);

const ProfileIcon = ({ user }) => (
    <div className="w-10 h-10 rounded-full border-2 border-slate-800 shadow-sm overflow-hidden bg-slate-900 flex items-center justify-center">
        {user?.image ? (
            <img src={user?.image} alt="Profile" className="w-full h-full object-cover" />
        ) : (
            <span className="text-xl">👤</span>
        )}
    </div>
);

const ProfileIconSmall = ({ user }) => (
    <div className="w-8 h-8 rounded-full border border-slate-800 overflow-hidden bg-slate-900 flex items-center justify-center">
        {user?.image ? (
            <img src={user?.image} alt="Profile" className="w-full h-full object-cover" />
        ) : (
            <span className="text-sm">👤</span>
        )}
    </div>
);

export default Navbar;