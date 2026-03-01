"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore.js";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();
  const loginRef = useRef(null);

  const loginSchema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/login", data);
      const userData = response.data.user;
      setUser(userData);
      toast.success("Login successful!");
      router.push("/auth/dashboardPage");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 pt-32 bg-[#020617] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div
        ref={loginRef}
        className="w-full max-w-lg bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden"
      >
        {/* Header Blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -z-10"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full -z-10"></div>

        <div className="relative z-10">
          {/* Logo/Icon */}
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/20 transform hover:rotate-6 transition-transform">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight tracking-tighter uppercase italic">
              Welcome Back
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
              Continue your premium experience
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <input
                {...register("email")}
                placeholder="name@example.com"
                className="w-full rounded-2xl bg-slate-950/50 border border-white/5 px-5 py-3.5 text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-semibold ml-1 translate-y-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl bg-slate-950/50 border border-white/5 px-5 py-3.5 text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
              />
              {errors.password && (
                <p className="text-red-500 text-xs font-semibold ml-1 translate-y-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl py-4 text-white font-black text-lg transition-all transform shadow-xl ${loading
                ? "bg-indigo-600/50 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-95 shadow-indigo-500/10"
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center pt-8 border-t border-white/5">
            <p className="text-sm text-slate-500 font-medium">
              New to Chatty?{" "}
              <Link
                href="/auth/registerPage"
                className="text-indigo-400 font-bold hover:text-white transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
