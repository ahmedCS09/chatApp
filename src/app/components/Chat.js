'use client'

import axios from "axios";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Send, MessageCircle, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import useAuthStore from "@/store/useAuthStore.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
};

export default function Chat() {
    const { user } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [friendSearch, setFriendSearch] = useState("");
    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const sidebarRef = useRef(null);
    const chatBoxRef = useRef(null);
    const emptyStateRef = useRef(null);
    const beepRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            beepRef.current = new Audio("/msgBeep.wav");
        }
    }, []);

    // AI Mutation using TanStack Query
    const aiMutation = useMutation({
        mutationFn: async (prompt) => {
            const res = await axios.post("/api/ai/openRouter", { message: prompt });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", selectedFriend?._id] });
            beepRef.current?.play().catch(e => console.log("Audio play failed:", e));
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.error || "AI Assistant is currently unavailable";
            toast.error(errorMessage);
        }
    });

    // Yup schema
    const chatSchema = yup.object({
        message: yup.string().required("Message is required"),
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(chatSchema),
    });

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Send message
    const submitHandler = async (data) => {
        if (!selectedFriend) {
            toast.error("Please select a friend first!");
            return;
        }

        const isAI = selectedFriend.email === "ai@chatty.com";

        try {
            if (isAI) {
                // For AI, use the mutation which preserves loading state
                aiMutation.mutate(data.message);
            } else {
                // For regular friends, send normally
                console.log("Sending Names to API:", user.fullName, selectedFriend.fullName);
                await axios.post("/api/chat/sendMessage", {
                    receiver: selectedFriend._id,
                    receiverName: selectedFriend.fullName,
                    senderName: user.fullName,
                    sender: user._id,
                    message: data.message
                });
                beepRef.current?.play().catch(e => console.log("Audio play failed:", e));
                queryClient.invalidateQueries({ queryKey: ["messages", selectedFriend?._id] });
            }

            reset();

        } catch (err) {
            console.error(err);
        }
    };

    // Get messages
    const getMessages = async () => {
        if (!selectedFriend) return [];

        const response = await axios.post("/api/chat/getMessages", {
            receiver: selectedFriend._id
        });

        return response.data;
    };

    const { data: messagesData } = useQuery({
        queryKey: ["messages", selectedFriend?._id],
        queryFn: getMessages,
        enabled: !!selectedFriend
    });



    // Scroll when messages update
    useEffect(() => {
        scrollToBottom();
    }, [messagesData]);

    // Get friends
    const getFriends = async () => {
        const response = await axios.get("/api/friendRequest/getFriends");
        return response?.data?.users;
    };

    const { data: friendsData } = useQuery({
        queryKey: ["friends"],
        queryFn: getFriends
    });

    useEffect(() => {
        if (!user?._id) return;

        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
            path: "/api/socket/io",
            transports: ["websocket"],
        });

        socketRef.current.on("connect", () => {
            console.log("[CHAT] Connected and joining room:", user._id);
            socketRef.current.emit("join", user._id);
        });

        socketRef.current.on("newMessage", (data) => {
            if (data.sender === selectedFriend?._id || data.receiver === selectedFriend?._id) {
                queryClient.invalidateQueries({ queryKey: ["messages", selectedFriend?._id] });
                scrollToBottom();
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log("Socket disconnected");
            }
        };
    }, [user?._id, selectedFriend?._id, queryClient]);

    const hasAnimatedEntrance = useRef(false);

    useEffect(() => {
        if (mounted && !hasAnimatedEntrance.current) {
            hasAnimatedEntrance.current = true;
            const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

            tl.fromTo(sidebarRef.current,
                { x: -50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8 }
            )
                .fromTo(chatBoxRef.current,
                    { x: 50, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8 },
                    "-=0.6"
                );
        }
    }, [mounted]);

    useEffect(() => {
        if (mounted && friendsData?.length > 0) {
            // Animating items only once when they enter the DOM
            gsap.fromTo(".friend-item",
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.05,
                    ease: "power3.out",
                    delay: 0.2,
                    clearProps: "all"
                }
            );
        }
    }, [mounted, friendsData, friendSearch]);

    // Animate empty state floating
    useEffect(() => {
        if (mounted && !selectedFriend) {
            gsap.to(".floating-icon", {
                y: -15,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }, [mounted, selectedFriend]);

    // Animate messages when they load
    useEffect(() => {
        if (mounted && messagesData && messagesData.length > 0) {
            gsap.fromTo(".msg-bubble",
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "power2.out",
                    overwrite: true
                }
            );
        }
    }, [messagesData, mounted]);

    if (!mounted) return null;

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)] mt-28 mx-4 md:mx-10 bg-transparent overflow-visible">
            {/* Friends Sidebar - Separate Card */}
            <div ref={sidebarRef} className={`flex-col ${selectedFriend ? 'hidden lg:flex' : 'flex w-full'} lg:w-[380px] bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden transition-all duration-500`}>
                <div className="p-8 border-b border-slate-100 bg-white/40">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            Messages
                        </h2>
                        <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 rounded-lg uppercase tracking-tighter">Live</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-11">Conversations</p>

                    {/* Friends Search Bar */}
                    <div className="mt-6 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={friendSearch}
                            onChange={(e) => setFriendSearch(e.target.value)}
                            className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-inner transition-all font-bold"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {friendsData?.filter(f => f.fullName?.toLowerCase().includes(friendSearch.toLowerCase())).length > 0 ? (
                        friendsData
                            .filter(f => f.fullName?.toLowerCase().includes(friendSearch.toLowerCase()))
                            .map(friend => (
                                <div
                                    key={friend._id}
                                    onClick={() => setSelectedFriend(friend)}
                                    className={`friend-item group flex items-center gap-4 p-4 rounded-[2rem] cursor-pointer transition-all duration-300 relative
                                ${selectedFriend?._id === friend._id
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                            : "hover:bg-white text-slate-700 hover:shadow-lg border border-transparent hover:border-slate-50"}`}
                                >
                                    <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center p-1 shadow-inner transition-colors
                                    ${selectedFriend?._id === friend._id ? "bg-indigo-500" : "bg-slate-100/50 group-hover:bg-indigo-50"}`}>
                                        {friend.image ? (
                                            <img src={friend.image} alt="" className="w-full h-full rounded-xl object-cover" />
                                        ) : (
                                            <span className={`text-xl font-black ${selectedFriend?._id === friend._id ? "text-white" : "text-slate-400"}`}>
                                                {friend?.fullName?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-black truncate tracking-tight transition-colors ${selectedFriend?._id === friend._id ? "text-white" : "text-slate-900"}`}>
                                            {friend?.fullName || "Chatty User"}
                                        </h3>
                                        <p className={`text-[10px] font-black uppercase tracking-wider truncate mt-0.5 
                                        ${selectedFriend?._id === friend._id ? "text-indigo-300" : "text-slate-400 group-hover:text-indigo-500"}`}>
                                            Active Now
                                        </p>
                                    </div>
                                    {selectedFriend?._id === friend._id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                                    )}
                                </div>
                            ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <Search className="w-12 h-12 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">
                                {friendSearch ? "No friends found" : "No Friends Yet"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Content Area - Separate Card */}
            <div ref={chatBoxRef} className={`flex-1 flex flex-col bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] border border-white/60 relative overflow-hidden ${!selectedFriend ? 'hidden lg:flex' : 'flex'}`}>

                {selectedFriend ? (
                    <div className="flex flex-col h-full animate-in fade-in duration-500">
                        {/* Elegant Chat Header */}
                        <div className="h-24 border-b border-white/40 bg-white/40 backdrop-blur-md flex items-center px-6 md:px-10 justify-between z-20">
                            <div className="flex items-center gap-5">
                                <button
                                    onClick={() => setSelectedFriend(null)}
                                    className="lg:hidden p-3 bg-white rounded-2xl shadow-sm text-slate-600 hover:bg-slate-50 transition-all border border-slate-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>

                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-100 border-2 border-white">
                                    {selectedFriend.image ? (
                                        <img src={selectedFriend.image} alt="" className="w-full h-full rounded-xl object-cover" />
                                    ) : (
                                        selectedFriend?.fullName?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedFriend?.fullName}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]"></span>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active Connection</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:flex gap-3">
                                <button className="p-3 bg-white/50 rounded-2xl border border-white/80 text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm">
                                    <Send className="w-5 h-5 rotate-45" />
                                </button>
                            </div>
                        </div>

                        {/* Enhanced Message Scroller */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-slate-50/30 custom-scrollbar">
                            {messagesData?.length > 0 ? (
                                messagesData.map((msg, index) => {
                                    const senderId = msg.sender?._id || msg.sender;
                                    // It's a "friend sender" if the sender is NOT the current user
                                    const isFriendSender = senderId !== user._id;

                                    return (
                                        <div key={msg._id || index} className={`msg-bubble flex flex-col ${!isFriendSender ? "items-end" : "items-start"} opacity-0`}>
                                            <div className={`max-w-[85%] md:max-w-[70%] relative group`}>
                                                <div className={`px-6 py-4 rounded-[2rem] text-sm font-medium tracking-tight shadow-md 
                                                    ${!isFriendSender
                                                        ? "bg-slate-900 text-white rounded-tr-none shadow-slate-200"
                                                        : "bg-white text-slate-700 border border-white rounded-tl-none shadow-slate-100"
                                                    }`}
                                                >
                                                    {msg.message}
                                                </div>
                                                <p className={`text-[9px] font-black uppercase tracking-widest mt-2 px-2 text-slate-400 ${!isFriendSender ? "text-right" : "text-left"}`}>
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                                    <div className="p-10 bg-white/50 rounded-[3rem] shadow-inner ring-8 ring-white/20">
                                        <MessageCircle className="w-16 h-16 opacity-20" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-slate-400 uppercase tracking-[.25em] text-xs">Start the Conversation</p>
                                        <p className="text-sm font-medium text-slate-400 mt-1">Send your first message to {selectedFriend?.fullName?.split(' ')[0]}</p>
                                    </div>
                                </div>
                            )}
                            {/* AI Thinking indicator bubble */}
                            {aiMutation.isPending && (
                                <div className="msg-bubble flex flex-col items-start translate-y-0 opacity-100 transition-all">
                                    <div className="max-w-[85%] md:max-w-[70%] relative group">
                                        <div className="px-6 py-4 rounded-[2rem] rounded-tl-none text-sm font-medium tracking-tight shadow-md bg-white text-slate-700 border border-white flex items-center gap-3">
                                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                            <span className="italic whitespace-nowrap">Chatty is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* High-End Input Field */}
                        <div className="p-6 md:p-8 bg-white/40 backdrop-blur-md border-t border-white/40 relative">

                            {/* AI Quick Assistant Bar */}
                            <form
                                onSubmit={handleSubmit(submitHandler)}
                                className="flex gap-4 items-center bg-white/80 p-2 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white focus-within:border-indigo-200 transition-all"
                            >
                                <div className="flex-1 relative pl-4">
                                    <input
                                        {...register("message")}
                                        className="w-full bg-transparent border-0 py-4 text-slate-900 font-bold placeholder:text-slate-400 focus:ring-0 outline-none"
                                        placeholder="Enter your message..."
                                        autoComplete="off"
                                    />
                                    {errors.message && (
                                        <p className="absolute -top-12 left-0 bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase animate-bounce">
                                            {errors.message.message}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={aiMutation.isPending}
                                    className="p-4 bg-indigo-600 text-white rounded-[1.75rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {aiMutation.isPending ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div ref={emptyStateRef} className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="floating-icon w-40 h-40 bg-white rounded-[3.5rem] flex items-center justify-center mb-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white group relative">
                            <div className="absolute inset-0 bg-indigo-500/5 rounded-[3.5rem] blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                            <MessageCircle className="w-20 h-20 text-indigo-100 group-hover:text-indigo-500 transition-all duration-700 group-hover:scale-110 relative z-10" />
                        </div>

                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
                            Your Conversations
                        </h2>

                        <p className="max-w-xs text-slate-400 font-bold text-sm uppercase tracking-widest border-t border-slate-100 pt-6">
                            Secure encrypted messaging
                        </p>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
}
