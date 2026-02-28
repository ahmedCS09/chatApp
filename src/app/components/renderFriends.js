'use client'

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { User, MessageSquare, UserMinus, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

export default function RenderFriends() {

    const queryClient = useQueryClient();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
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
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <div className="w-20 h-20 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold uppercase text-xs">Syncing your inner circle...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Connection Issues</h3>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!friendsData || friendsData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <User className="w-16 h-16 text-indigo-400 mb-4" />
                <h3 className="text-3xl font-black text-slate-900 mb-3">Your circle is empty</h3>
                <button
                    onClick={() => router.push("/auth/dashboardPage")}
                    className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl"
                >
                    Search Community
                </button>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                <div>
                    <h2 className="friends-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        My Friends
                        <span className="text-sm font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-xl">
                            {friendsData.length}
                        </span>
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Manage your connections and active chats.
                    </p>
                </div>

                <button className="p-3 text-slate-400 hover:text-indigo-600 transition-all">
                    <MoreHorizontal className="w-6 h-6" />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">

                {friendsData.map((friend) => (

                    <div
                        key={friend?._id}
                        className="friend-card group relative bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/40 flex flex-col items-center transition-all duration-300"
                    >

                        {/* Remove Button */}
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                                onClick={() => removeFriendMutation.mutate(friend?._id)}
                                className="p-2 text-slate-300 hover:text-red-500"
                            >
                                <UserMinus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Avatar */}
                        <div className="avatar-float relative mb-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center overflow-hidden">
                                {friend?.image ? (
                                    <img
                                        src={friend.image}
                                        alt={friend.fullName}
                                        className="w-full h-full object-cover rounded-[2rem]"
                                    />
                                ) : (
                                    <span className="text-3xl font-black text-white">
                                        {friend?.fullName?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col items-center w-full mb-8">
                            <h3 className="text-xl font-black text-slate-900 text-center truncate">
                                {friend?.fullName || "Chatty User"}
                            </h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                Active Connection
                            </p>
                        </div>

                        {/* Chat Button */}
                        <button
                            onClick={() => router.push("/chat/chatPage")}
                            className="w-full py-4 px-6 bg-slate-900 text-white font-black text-sm rounded-[1.5rem] flex items-center justify-center gap-3"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>Start Chat</span>
                        </button>

                    </div>

                ))}

            </div>
        </div>
    );
}