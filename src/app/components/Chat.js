'use client'

import axios from "axios";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Send, MessageCircle, Search, Loader2, Shield, ChevronLeft, Phone, Video, MoreVertical, Paperclip, Smile, Home } from "lucide-react";
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
    const messagesContainerRef = useRef(null);
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

    // Auto-scroll to bottom of message container only (prevents window scroll)
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    // Delete chat handler
    const deleteChatHandler = async (chatId) => {
        if (!selectedFriend) return;

        const res = await axios.delete("/api/chat/deleteChat", {
            data: { chatId }
        });

        if (res.status === 200) {
            toast.success("Chat deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["messages", selectedFriend._id] });
        }
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
                console.log("Sending Names to API:", user?.fullName, selectedFriend.fullName);
                await axios.post("/api/chat/sendMessage", {
                    receiver: selectedFriend._id,
                    receiverName: selectedFriend.fullName,
                    senderName: user?.fullName,
                    sender: user?._id,
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

    if (user?.role === "admin") {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[70vh] animate-in fade-in duration-1000">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
                <div className="p-12 bg-slate-900/50 rounded-[4rem] border border-white/5 shadow-2xl mb-10 ring-8 ring-white/5 group hover:scale-105 transition-transform duration-500">
                    <Shield className="w-24 h-24 text-indigo-500 opacity-80" />
                </div>
                <h2 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase italic">Access Restricted</h2>
                <div className="flex flex-col items-center gap-4 max-w-md">
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Security Protocol 403</p>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Administrative identities are restricted from the social segment of the platform.
                        Please utilize the primary dashboard for system oversight and management.
                    </p>
                </div>
                <button
                    onClick={() => window.location.href = "/auth/dashboardPage"}
                    className="mt-12 px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:bg-indigo-500 transition-all active:scale-95 group flex items-center gap-3 uppercase tracking-widest text-xs"
                >
                    <Home className="w-5 h-5" />
                    Return to Terminal
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)] mt-32 mx-4 md:mx-10 bg-transparent overflow-visible">
            {/* Friends Sidebar - Separate Card */}
            <div ref={sidebarRef} className={`flex-col ${selectedFriend ? 'hidden lg:flex' : 'flex w-full'} lg:w-[380px] bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden transition-all duration-500`}>
                <div className="p-8 border-b border-white/5 bg-slate-950/20">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            Messages
                        </h2>
                        <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-1 rounded-lg uppercase tracking-tighter shadow-lg shadow-indigo-500/20">Live</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-11">Conversations</p>

                    {/* Friends Search Bar */}
                    <div className="mt-6 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={friendSearch}
                            onChange={(e) => setFriendSearch(e.target.value)}
                            className="block w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-inner transition-all font-bold"
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
                                            ? "bg-indigo-600/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.1)] border border-indigo-500/50"
                                            : "hover:bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/5"}`}
                                >
                                    <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center p-1 shadow-inner transition-colors
                                    ${selectedFriend?._id === friend._id ? "bg-slate-900" : "bg-slate-800/50 group-hover:bg-slate-800"}`}>
                                        {friend.image ? (
                                            <img src={friend.image} alt="" className="w-full h-full rounded-xl object-cover" />
                                        ) : (
                                            <span className={`text-xl font-black ${selectedFriend?._id === friend._id ? "text-white" : "text-slate-600"}`}>
                                                {friend?.fullName?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#020617] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-black truncate tracking-tight transition-colors ${selectedFriend?._id === friend._id ? "text-white" : "text-white"}`}>
                                            {friend?.fullName || "Chatty User"}
                                        </h3>
                                        <div className={`text-[10px] font-black uppercase tracking-widest truncate ${selectedFriend?._id === friend._id ? "text-indigo-400" : "text-slate-500"}`}>
                                            Online Now
                                        </div>
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
            <div ref={chatBoxRef} className={`flex-1 flex-col ${!selectedFriend ? 'hidden lg:flex' : 'flex'} bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden transition-all duration-500 ring-1 ring-white/5`}>
                {!selectedFriend ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                        {/* Background blobs for empty state */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full -z-10"></div>
                        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full -z-10 animate-pulse"></div>

                        <div className="floating-icon p-8 bg-slate-950/50 rounded-[2.5rem] border border-white/5 shadow-2xl mb-8 group hover:scale-110 transition-transform duration-500">
                            <MessageCircle className="w-20 h-20 text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        </div>
                        <h3 className="text-4xl font-black text-white mb-4 tracking-tight uppercase italic">Your Inbox</h3>
                        <p className="max-w-md text-slate-500 font-bold leading-relaxed mb-8">
                            Select a friend from the sidebar and start a new conversation.
                            The premium way to connect with your circle.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-[0.3em]">
                            <Shield className="w-4 h-4 text-indigo-600" />
                            Secure End-to-End Chat
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="px-8 py-6 border-b border-white/5 bg-slate-950/30 backdrop-blur-md flex items-center justify-between z-10">
                            <div className="flex items-center gap-5">
                                <button onClick={() => setSelectedFriend(null)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="relative group">
                                    <div className="w-12 h-12 rounded-xl border-2 border-indigo-600 bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg transform group-hover:scale-110 transition-transform">
                                        {selectedFriend?.image ? (
                                            <img src={selectedFriend.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-white">{selectedFriend.fullName?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#020617] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-black text-white tracking-tight">{selectedFriend.fullName}</h2>
                                    <div className="flex items-center gap-1.5 ">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Now</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Message Scroller */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-slate-950/30 custom-scrollbar">
                            {messagesData?.length > 0 ? (
                                messagesData.map((msg, index) => {
                                    const senderId = msg.sender?._id || msg.sender;
                                    // It's a "friend sender" if the sender is NOT the current user
                                    const isFriendSender = senderId !== user?._id;

                                    return (
                                        <div key={msg._id || index} className={`msg-bubble flex flex-col ${!isFriendSender ? "items-end" : "items-start"} opacity-0`}>
                                            <div className={`max-w-[85%] md:max-w-[70%] relative group`}>
                                                <div className={`px-6 py-4 rounded-[2rem] text-sm font-medium tracking-tight shadow-md 
                                                    ${!isFriendSender
                                                        ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-900/20"
                                                        : "bg-slate-800 text-white border border-white/5 rounded-tl-none shadow-slate-900/20"
                                                    }`}
                                                >
                                                    {msg.message}
                                                </div>
                                                <p className={`text-[9px] font-black uppercase tracking-widest mt-2 px-2 text-slate-400 ${!isFriendSender ? "text-right" : "text-left"}`}>
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                            </div>

                                            {/* Delete Button */}
                                            {!isFriendSender && (
                                                <button
                                                    onClick={() => deleteChatHandler(msg._id)}
                                                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-black uppercase hover:bg-red-600 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                                    <div className="p-10 bg-slate-900/50 rounded-[3rem] shadow-inner ring-8 ring-white/5">
                                        <MessageCircle className="w-16 h-16 opacity-20 text-white" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-slate-500 uppercase tracking-[.25em] text-xs">Start the Conversation</p>
                                        <p className="text-sm font-medium text-slate-600 mt-1">Send your first message to {selectedFriend?.fullName?.split(' ')[0]}</p>
                                    </div>
                                </div>
                            )}
                            {/* AI Thinking indicator bubble */}
                            {aiMutation.isPending && (
                                <div className="msg-bubble flex flex-col items-start translate-y-0 opacity-100 transition-all">
                                    <div className="max-w-[85%] md:max-w-[70%] relative group">
                                        <div className="px-6 py-4 rounded-[2rem] rounded-tl-none text-sm font-medium tracking-tight shadow-md bg-slate-800 text-white border border-white/5 flex items-center gap-3">
                                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                            <span className="italic whitespace-nowrap">Chatty is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-6 border-t border-white/5 bg-slate-950/30 backdrop-blur-md">
                            <form onSubmit={handleSubmit(submitHandler)} className="relative flex items-center gap-4 max-w-5xl mx-auto">
                                <div className="flex-1 relative group">
                                    <input
                                        dir="ltr"
                                        {...register("message")}
                                        className="w-full pl-6 pr-12 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-inner transition-all font-medium"
                                        placeholder={`Message ${selectedFriend.fullName}...`}
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
                                    className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all group"
                                >
                                    {aiMutation.isPending ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    )}
                                </button>
                            </form>
                            <div className="mt-2 text-center">
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Encrypted Connection</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}
