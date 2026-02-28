"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import UpdateUserModal from "../auth/Modals/updateUserModal";
import { useState, useEffect, useRef } from "react";
import { User, Mail, Shield, Edit, Calendar } from "lucide-react";
import { gsap } from "gsap";
import { useSearchParams } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";

export default function Profile() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { user: loggedInUser } = useAuthStore();
  const [openModal, setOpenModal] = useState(false);
  const containerRef = useRef(null);

  const getUser = async () => {
    const url = userId ? `/api/auth/getUserById?id=${userId}` : "/api/auth/getUser";
    const response = await axios.get(url);
    return response?.data?.user;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: getUser,
  });

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

      // Button Reveal
      gsap.from(".update-btn", {
        y: 30,
        opacity: 0,
        delay: 0.6,
        duration: 0.8,
        ease: "power3.out"
      });

    }, containerRef);

    return () => ctx.revert();

  }, [data]);

  return (
    <div className="w-full pt-32 pb-24 flex justify-center items-start px-4 bg-slate-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="w-20 h-20 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase text-xs">
            Accessing your profile data...
          </p>
        </div>

      ) : error ? (
        <div className="text-center p-12 bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-red-100 max-w-sm">
          <div className="w-20 h-20 bg-red-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            Access Error
          </h3>
          <p className="text-slate-500 font-medium mb-8">
            We couldn't retrieve your profile information.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold"
          >
            Reload Page
          </button>
        </div>

      ) : (
        <div
          ref={containerRef}
          className="profile-card w-full max-w-lg bg-white/70 backdrop-blur-2xl rounded-[3rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden"
        >

          {/* Header Banner */}
          <div className="h-44 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative"></div>

          <div className="px-8 pb-10">

            {/* Profile Image */}
            <div className="relative -mt-20 mb-8 flex justify-center">
              <div className="profile-image w-40 h-40 rounded-[2.5rem] border-8 border-white bg-slate-100 shadow-2xl overflow-hidden">
                {data?.image ? (
                  <img
                    src={data?.image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                    <User className="w-20 h-20" />
                  </div>
                )}
              </div>
            </div>

            {/* Name + Role */}
            <div className="text-center mb-10 space-y-2">
              <h1 className="text-4xl font-black text-slate-900 uppercase">
                {data?.fullName || "Chatty User"}
              </h1>
              <p className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                {data?.role || "Verified Member"}
              </p>
            </div>

            {/* Detail Cards */}
            <div className="grid grid-cols-1 gap-4 mb-10">
              <DetailCard
                icon={<Mail className="w-5 h-5" />}
                label="Email Address"
                value={data?.email || "No email available"}
                color="indigo"
              />
              <DetailCard
                icon={<Shield className="w-5 h-5" />}
                label="Account Security"
                value={data?.role === "admin" ? "Administrator" : "Standard Access"}
                color="purple"
              />
              <DetailCard
                icon={<Calendar className="w-5 h-5" />}
                label="Member Since"
                value="February 2026"
                color="blue"
              />
            </div>

            {/* Update Button - Only for current user or self-view */}
            {(!userId || userId === loggedInUser?._id) && (
              <button
                onClick={() => setOpenModal(true)}
                className="update-btn w-full flex items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-white font-black text-lg shadow-2xl hover:bg-indigo-600 transition-all"
              >
                <Edit className="w-5 h-5" />
                <span>Update Profile</span>
              </button>
            )}

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
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="detail-card flex items-center p-4 bg-white/50 border border-slate-100 rounded-3xl transition-all duration-300 hover:border-indigo-100 hover:bg-white">
      <div className={`w-12 h-12 rounded-2xl ${colorMap[color]} flex items-center justify-center shadow-inner`}>
        {icon}
      </div>
      <div className="ml-5 flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">
          {label}
        </p>
        <p className="text-slate-800 font-bold truncate">
          {value}
        </p>
      </div>
    </div>
  );
};