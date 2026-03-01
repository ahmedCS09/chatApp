"use client";

import axios from "axios";
import UpdateUserModal from "../auth/Modals/updateUserModal";
import { useState, useEffect, useRef } from "react";
import { User, Mail, Shield, Edit, Calendar, Trash2, Loader2, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const userId = searchParams.get("id");
  const { user: loggedInUser } = useAuthStore();
  const [openModal, setOpenModal] = useState(false);
  const containerRef = useRef(null);
  const queryClient = useQueryClient();

  const getUser = async () => {
    const url = userId ? `/api/auth/getUserById?id=${userId}` : "/api/auth/getUser";
    const response = await axios.get(url);
    return response?.data?.user;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: getUser,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) =>
      axios.delete("/api/auth/deleteUser", { data: { userId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User account deleted permanently");
      router.push("/auth/dashboardPage");
    },
    onError: (error) => {
      toast.error("Error deleting user: " + (error.response?.data?.message || "Internal server error"));
    },
  });

  const handleDeleteUser = () => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete the account of ${data?.fullName}? This action is irreversible and all messages/friends will be lost.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  // 🔥 GSAP Animations
  useEffect(() => {
    if (!data) return;

    const ctx = gsap.context(() => {

      // Main Card Entrance
      gsap.from(".profile-card", {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      // Profile Image Pop Effect
      gsap.from(".profile-image", {
        scale: 0.6,
        opacity: 0,
        rotation: -15,
        duration: 1,
        ease: "back.out(1.7)"
      });

      // Floating Profile Image
      gsap.to(".profile-image", {
        y: -8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      // Stagger Detail Cards
      gsap.from(".detail-card", {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out"
      });

      /* Removed Button Reveal to prevent visibility conflicts */

    }, containerRef);

    return () => ctx.revert();

  }, [data]);

  const isDeleting = deleteUserMutation.isPending;

  return (
    <div className="w-full pt-32 pb-24 flex justify-center items-start px-4 bg-[#020617] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="w-20 h-20 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase text-xs">
            Accessing your profile data...
          </p>
        </div>

      ) : error ? (
        <div className="text-center p-12 bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/5 max-w-sm">
          <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <Shield className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">
            Access Error
          </h3>
          <p className="text-slate-500 font-medium mb-8">
            We couldn't retrieve your profile information.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white text-slate-950 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
          >
            Reload Page
          </button>
        </div>

      ) : (
        <div
          ref={containerRef}
          className="profile-card relative z-10 w-full max-w-lg bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden"
        >

          {/* Header Banner */}
          <div className="h-44 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative shadow-inner"></div>

          <div className="px-8 pb-10">

            {/* Profile Image */}
            <div className="relative -mt-20 mb-8 flex justify-center">
              <div className="profile-image w-40 h-40 rounded-[2.5rem] border-8 border-[#0f172a] bg-slate-800 shadow-2xl overflow-hidden">
                {data?.image ? (
                  <img
                    src={data?.image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-900/30 text-indigo-400">
                    <User className="w-20 h-20" />
                  </div>
                )}
              </div>
            </div>

            {/* Name + Role */}
            <div className="text-center mb-10">
              <h2 className="profile-info text-3xl font-black text-white tracking-tight mb-2">
                {data?.fullName}
              </h2>
              <div className="profile-info inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold tracking-widest uppercase border border-indigo-500/20">
                <Shield className="w-3.5 h-3.5" />
                {data?.role || "Member"}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="profile-field space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    disabled
                    value={data?.fullName || ""}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-12 py-4 text-slate-300 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="profile-field space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    readOnly
                    value={data?.email || ""}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-12 py-4 text-slate-300 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Stats / Info Cards */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="profile-field p-4 bg-slate-950/30 rounded-2xl border border-white/5 text-center group hover:bg-white/5 transition-all">
                  <div className="text-xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">Active</div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Account Status
                  </div>
                </div>
                <div className="profile-field p-4 bg-slate-950/30 rounded-2xl border border-white/5 text-center group hover:bg-white/5 transition-all">
                  <div className="text-xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">
                    {new Date(data?.createdAt || Date.now()).getFullYear()}
                  </div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Joined Chatty
                  </div>
                </div>
              </div>

              {/* Dynamic Action Buttons */}
              <div className="pt-8 space-y-4 relative z-50">
                {pathname === "/auth/profilePage" && !userId && (
                  <button
                    onClick={() => setOpenModal(true)} // Added onClick to open modal
                    className="action-btn relative z-50 w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 transform active:scale-95 transition-all flex items-center justify-center gap-3 group"
                  >
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Update Profile
                  </button>
                )}

                {/* Administrative Deletion Button */}
                {loggedInUser?.role === "admin" && userId && String(userId) !== String(loggedInUser?._id) && (
                  <button
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                    className="action-btn relative z-50 w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 transform active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Deleting Account...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Delete User Account
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <UpdateUserModal open={openModal} close={() => setOpenModal(false)} />
    </div>
  );
}

// Detail Card Component
const DetailCard = ({ icon, label, value, color }) => {
  const colorMap = {
    indigo: "bg-indigo-500/20 text-indigo-400",
    purple: "bg-purple-500/20 text-purple-400",
    blue: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="detail-card flex items-center p-4 bg-slate-900/50 border border-white/5 rounded-3xl transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-800">
      <div className={`w-12 h-12 rounded-2xl ${colorMap[color]} flex items-center justify-center shadow-inner`}>
        {icon}
      </div>
      <div className="ml-5 flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">
          {label}
        </p>
        <p className="text-white font-bold truncate">
          {value}
        </p>
      </div>
    </div>
  );
};
