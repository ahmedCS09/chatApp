"use client";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore.js";
import { toast } from "sonner";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 pt-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 p-10 shadow-2xl shadow-indigo-100/50">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4">
              <span className="text-white text-2xl font-bold">Chatty</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="name@company.com"
                className="w-full rounded-2xl bg-slate-50/50 border border-slate-200 px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-semibold ml-1 translate-y-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-bold text-slate-700">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl bg-slate-50/50 border border-slate-200 px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
              {errors.password && (
                <p className="text-red-500 text-xs font-semibold ml-1 translate-y-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl py-4 text-white font-bold text-lg transition-all transform shadow-xl ${loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-indigo-200"
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
          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-600 font-medium">
              New to Chatty?{" "}
              <Link
                href="/auth/registerPage"
                className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
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
