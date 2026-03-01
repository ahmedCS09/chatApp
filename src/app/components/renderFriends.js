'use client'

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { User, MessageSquare, UserMinus, MoreHorizontal, Search, Shield, Home } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import useAuthStore from "@/store/useAuthStore.js";

export default function RenderFriends() {

    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef(null);

    const removeFriendMutation = useMutation({
        mutationFn: (friendId) =>
            axios.post("/api/friendRequest/removeFriend", { friendId }),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["friends"] });
            toast.success("Friend removed successfully");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to remove friend");
        }
    });

    const getFriends = async () => {
        const response = await axios.get("/api/friendRequest/getFriends");
        return response?.data?.users;
    };

    const { data: friendsData, isLoading, isError } = useQuery({
        queryKey: ["friends"],
        queryFn: getFriends
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // 🔥 GSAP Animation
    useEffect(() => {
        if (!friendsData) return;

        const ctx = gsap.context(() => {

            // Heading Animation
            gsap.from(".friends-heading", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });

            // Cards Stagger Animation
            gsap.from(".friend-card", {
                y: 60,
                opacity: 0,
                scale: 0.9,
                duration: 0.8,
                stagger: 0.12,
                ease: "power3.out"
            });

            // Floating Avatar Animation
            gsap.to(".avatar-float", {
                y: -6,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });

        }, containerRef);

        return () => ctx.revert();

    }, [friendsData]);

    // Hover Animation (GSAP Powered)
    useEffect(() => {
        const cards = document.querySelectorAll(".friend-card");

        cards.forEach((card) => {
            card.addEventListener("mouseenter", () => {
                gsap.to(card, {
                    y: -12,
                    scale: 1.03,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener("mouseleave", () => {
                gsap.to(card, {
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

    }, [friendsData]);

    if (!mounted || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in duration-700">
                <div className="relative">
                    <div className="w-24 h-24 border-8 border-slate-950/50 border-t-indigo-600 rounded-[2.5rem] animate-spin shadow-2xl shadow-indigo-500/10"></div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Syncing Circle</p>
                    <p className="text-white/20 font-medium text-xs">Preparing your premium workspace...</p>
                </div>
            </div>
        );
    }

    if (user?.role === "admin") {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center min-h-[60vh] animate-in zoom-in-95 duration-1000">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full -z-10 animate-pulse"></div>
                <div className="p-10 bg-slate-900/50 rounded-[4rem] border border-white/5 shadow-2xl mb-10 ring-8 ring-white/5 hover:rotate-3 transition-transform duration-500">
                    <Shield className="w-20 h-20 text-indigo-500 opacity-60" />
                </div>
                <h3 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">Terminal Restriction</h3>
                <div className="space-y-2 mb-10">
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">Administrative Clearance Verified</p>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">
                        The social network graph is restricted for administrative accounts to ensure system-wide impartiality.
                        Redirecting focus to the command center.
                    </p>
                </div>
                <button
                    onClick={() => window.location.href = "/auth/dashboardPage"}
                    className="px-12 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 hover:-translate-y-1 transition-all active:scale-95 group flex items-center gap-3 uppercase tracking-widest text-[10px]"
                >
                    <Home className="w-5 h-5" />
                    Back to Terminal
                </button>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
                <div className="p-8 bg-red-500/10 rounded-[3rem] border border-red-500/20 mb-8">
                    <UserMinus className="w-16 h-16 text-red-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter">Connection Fault</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-xs">We encountered a secure barrier. Please re-authenticate your session.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl border border-white/5 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                >
                    Retry Protocol
                </button>
            </div>
        );
    }

    if (!friendsData || friendsData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-1000">
                <div className="p-12 bg-slate-900/50 rounded-[4rem] border border-white/5 mb-10 shadow-2xl shadow-indigo-500/5 ring-8 ring-white/5">
                    <User className="w-20 h-20 text-indigo-500 opacity-40" />
                </div>
                <h3 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">Circle Empty</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-10">Expand your global influence</p>
                <button
                    onClick={() => router.push("/auth/dashboardPage")}
                    className="px-12 py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 hover:-translate-y-1 transition-all active:scale-95"
                >
                    Discover Community
                </button>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-12 pb-20">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 px-6">
                <div className="text-center sm:text-left">
                    <h2 className="friends-heading text-4xl sm:text-5xl font-black text-white tracking-tighter flex items-center justify-center sm:justify-start gap-4 uppercase italic">
                        The Circle
                        <span className="text-xs font-black bg-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-indigo-500/20 not-italic tracking-normal">
                            {friendsData.filter(f => f.email !== "ai@chatty.com").length}
                        </span>
                    </h2>
                    <p className="text-white font-black uppercase text-[10px] tracking-[0.3em] mt-2">
                        Premium Network Management
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative group flex-1 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Filter connections..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-white/5 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 shadow-inner transition-all font-bold"
                        />
                    </div>
                    <button className="p-4 bg-slate-900 rounded-2xl text-slate-400 hover:text-white border border-white/5 transition-all shadow-lg hover:bg-slate-800">
                        <MoreHorizontal className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Dynamic Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 px-4">

                {friendsData
                    .filter(f => f.email !== "ai@chatty.com")
                    .filter(f => f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((friend) => (

                        <div
                            key={friend?._id}
                            className="friend-card group relative bg-slate-900/50 backdrop-blur-2xl rounded-[3.5rem] p-10 shadow-2xl border border-white/5 flex flex-col items-center transition-all duration-500 ring-1 ring-white/5 hover:ring-indigo-500/30"
                        >

                            {/* Secure Removal Protocol */}
                            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <button
                                    onClick={() => removeFriendMutation.mutate(friend?._id)}
                                    className="p-3 bg-slate-950/50 text-slate-500 hover:text-red-500 rounded-2xl border border-white/5 hover:bg-red-500/10 transition-all shadow-xl"
                                >
                                    <UserMinus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Premium Avatar Visualizer */}
                            <div className="avatar-float relative mb-8">
                                <div className="w-28 h-28 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center p-1.5 shadow-2xl shadow-indigo-500/20 ring-4 ring-indigo-500/10">
                                    {friend?.image ? (
                                        <img
                                            src={friend.image}
                                            alt={friend.fullName}
                                            className="w-full h-full object-cover rounded-[2rem]"
                                        />
                                    ) : (
                                        <span className="text-4xl font-black text-white">
                                            {friend?.fullName?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#020617] rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
                            </div>

                            {/* User Identity Matrix */}
                            <div className="flex flex-col items-center w-full mb-10 text-center">
                                <h3 className="text-2xl font-black text-white tracking-tighter truncate w-full italic uppercase">
                                    {friend?.fullName || "Chatty User"}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        Active Identity
                                    </p>
                                </div>
                            </div>

                            {/* Communication Trigger */}
                            <button
                                onClick={() => router.push("/chat/chatPage")}
                                className="w-full py-5 px-8 bg-indigo-600 text-white font-black text-xs rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-105 transition-all active:scale-95 group/btn uppercase tracking-widest"
                            >
                                <MessageSquare className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                <span>Initialize Chat</span>
                            </button>

                        </div>

                    ))}

            </div>
        </div>
    );
}
