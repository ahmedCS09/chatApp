"use client";

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import useAuthStore from "@/store/useAuthStore";
import { UserPlus, Users, Search, Sparkles, Trash2, Loader2, Eye, User } from "lucide-react";
import { toast } from "sonner";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  // ---------------- UI ----------------
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const iconRef = useRef(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", search],
    queryFn: async () => {
      const res = await axios.get("/api/auth/getAllUsers", {
        params: { search },
      });
      return res.data.users;
    },
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      const res = await axios.get("/api/friendRequest/getPendingRequests");
      return res.data;
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId) =>
      axios.post("/api/friendRequest/removeFriend", { requestId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["users", search] });
      toast.success("Request removed!");
    },
    onError: (error) => {
      toast.error("Error removing request: " + (error.response?.data?.message || error.message));
    },
  });

  //outgoing requests
  const getOutgoingRequest = (userId) => {
    if (!pendingRequests || !userId) return null;
    return pendingRequests.find((req) => {
      const rId = String(req.receiver?._id || req.receiver);
      const sId = String(req.sender?._id || req.sender);
      const uId = String(user?._id);

      return (
        sId === uId &&
        rId === String(userId) &&
        req.status === "pending"
      );
    });
  };

  //incoming requests
  const incomingRequests = (userId) => {
    if (!pendingRequests || !user?._id || !userId) return false;

    return pendingRequests.some((req) => {
      const rId = String(req.receiver?._id || req.receiver);
      const sId = String(req.sender?._id || req.sender);
      const uId = String(user._id);

      return (
        rId === uId &&
        sId === String(userId) &&
        req.status === "pending"
      );
    });
  };

  const sendMutation = useMutation({
    mutationFn: (id) =>
      axios.post("/api/friendRequest/sendRequest", { receiver: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["users", search] });
      toast.success("Friend request sent!");
    },
    onError: (error) => {
      toast.error("Error sending request: " + (error.response?.data?.message || error.message));
    },
  });

  const acceptMutation = useMutation({
    mutationFn: ({ requestId }) =>
      axios.post("/api/friendRequest/acceptRequest", { requestId }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["users", search] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success(`${variables.name} is now your friend`);
    },
    onError: (error) => {
      toast.error("Error accepting request: " + (error.response?.data?.message || error.message));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) =>
      axios.delete("/api/auth/deleteUser", { data: { userId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", search] });
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error("Error deleting user: " + (error.response?.data?.message || error.message));
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(headerRef.current, {
        y: -50,
        duration: 1.2,
      })
        .from(searchRef.current, {
          scale: 0.8,
          duration: 0.8,
        }, "-=0.8")
        .from(listRef.current, {
          y: 100,
          duration: 1,
        }, "-=0.6");

      // Floating animation for the icon
      gsap.to(iconRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, [mounted]);

  // Stagger animation when users load
  useEffect(() => {
    if (mounted && users && users.length > 0) {
      gsap.from(".user-card", {
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        overwrite: true
      });
    }
  }, [mounted, users]);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 py-12 px-4 pt-32 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      {/* Abstract Background Decoration */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-10 relative">
        {/* Header Section */}
        <div ref={headerRef} className="flex flex-col items-center text-center space-y-4">
          <div ref={iconRef} className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 ring-8 ring-indigo-50 relative">
            <Users className="w-12 h-12 text-white" />
            <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-lg shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex flex-col items-center">
            {user && (
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100/50 text-indigo-600 text-sm font-bold tracking-tight shadow-lg shadow-indigo-100/50 transform hover:scale-105 transition-all duration-300">
                {user.image ? (
                  <img src={user.image} className="w-6 h-6 rounded-full object-cover border border-indigo-100" alt="" />
                ) : (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                  </span>
                )}
                {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 ml-1">{user.fullName}</span>
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {user?.role === "admin" ? (
                <>Admin <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Console</span></>
              ) : (
                <>Grow your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Circle</span></>
              )}
            </h1>
            <p className="mt-4 text-lg text-slate-600 font-medium max-w-lg mx-auto">
              {user?.role === "admin"
                ? "Manage users, oversee activities, and keep the community healthy."
                : "Find and connect with people in the Chatty community."}
            </p>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div ref={searchRef} className="relative max-w-lg mx-auto group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder={user?.role === "admin" ? "Search members by name or ID..." : "Search by name..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all text-lg"
          />
        </div>

        {/* Content Area */}
        <div ref={listRef} className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/60 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 font-semibold animate-pulse">Scanning the community...</p>
            </div>
          ) : users && users.length > 0 ? (
            <div className="grid grid-cols-1 divide-y divide-slate-100 p-2">
              {users.map((u, index) => {
                const outgoingRequest = getOutgoingRequest(u._id);
                const isSending = sendMutation.isPending && sendMutation.variables === u._id;
                const isRejecting = rejectMutation.isPending && rejectMutation.variables === outgoingRequest?._id;

                return (
                  <div
                    key={u._id}
                    className="user-card group p-6 hover:bg-slate-50 transition-all rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 opacity-100"
                  >
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {u.image ? (
                            <img src={u.image} alt={u.fullName} className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            u.fullName?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{u.fullName}</h3>
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Available to chat
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Admin Delete User Button */}
                      {user?.role === "admin" && String(u._id) !== String(user._id) && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${u.fullName}? This cannot be undone.`)) {
                              deleteUserMutation.mutate(u._id);
                            }
                          }}
                          disabled={deleteUserMutation.isPending}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                          title="Delete User"
                        >
                          {deleteUserMutation.isPending && deleteUserMutation.variables === u._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      )}

                      {/* Admin/User Specific Interaction Block */}
                      {user?.role === "admin" ? (
                        <Link
                          href={`/auth/profilePage?id=${u._id}`}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-slate-200 transform active:scale-95 transition-all text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>See Profile</span>
                        </Link>
                      ) : (
                        <>
                          {incomingRequests(u._id) ? (
                            <div className="flex gap-2 w-full">
                              <button
                                onClick={() => {
                                  const req = pendingRequests.find(
                                    (r) =>
                                      String(r.sender?._id || r.sender) === String(u._id) &&
                                      r.status === "pending"
                                  );
                                  if (req) acceptMutation.mutate({ requestId: req._id, name: u.fullName });
                                }}
                                disabled={acceptMutation.isPending}
                                className="flex-1 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-100 transform active:scale-95 transition-all text-sm"
                              >
                                {acceptMutation.isPending ? "..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => {
                                  const req = pendingRequests.find(
                                    (r) =>
                                      String(r.sender?._id || r.sender) === String(u._id) &&
                                      r.status === "pending"
                                  );
                                  if (req) rejectMutation.mutate(req._id);
                                }}
                                disabled={rejectMutation.isPending}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transform active:scale-95 transition-all text-sm"
                              >
                                {rejectMutation.isPending ? "..." : "Delete"}
                              </button>
                            </div>
                          ) : outgoingRequest ? (
                            <button
                              onClick={() => rejectMutation.mutate(outgoingRequest._id)}
                              disabled={isRejecting}
                              className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-sm disabled:opacity-50"
                            >
                              {isRejecting ? "Wait..." : "Cancel Request"}
                            </button>
                          ) : (
                            <button
                              onClick={() => sendMutation.mutate(u._id)}
                              disabled={isSending}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transform active:scale-95 transition-all text-sm"
                            >
                              {isSending ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                <UserPlus className="w-4 h-4" />
                              )}
                              <span>{isSending ? "Sending..." : "Add Friend"}</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center px-6">
              <div className="p-6 bg-slate-50 rounded-full mb-6">
                <Users className="w-16 h-16 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {user?.role === "admin" ? "No users found" : "Nobody here yet"}
              </h3>
              <p className="text-slate-500 max-w-xs">
                {user?.role === "admin"
                  ? "Try a different search term or check back later for new registrations."
                  : "Try searching for another name or check back later."}
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-6 text-indigo-600 font-bold hover:text-indigo-700"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
