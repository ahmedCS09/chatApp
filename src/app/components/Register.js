"use client";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore.js";

export default function Register() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const registerSchema = yup.object().shape({
    fullName: yup.string().required("Full Name is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    adminSecret: yup.string().optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/register", {
        fullName: data?.fullName,
        email: data?.email,
        password: data?.password,
        adminSecret: data?.adminSecret,
      });

      if (response.status === 200) {
        toast.success("Registration successful!");
        setUser(response.data.user);
        router.push("/auth/dashboardPage");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Registration failed: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 pt-32 bg-[#020617] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div
        className="w-full max-w-lg bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden"
      >
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -z-10"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full -z-10"></div>

        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase italic">
              Join Chatty
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
              Experience the future of connection
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <input
                {...register("fullName")}
                placeholder="John Doe"
                className="w-full rounded-2xl bg-slate-950/50 border border-white/5 px-5 py-3.5 text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs font-semibold ml-1 translate-y-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email Address */}
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
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Password
              </label>
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

            {/* Admin Toggle */}
            <div className="bg-slate-950/30 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase ml-1">Admin Access</span>
                <button
                  type="button"
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAdmin ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAdmin ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {isAdmin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    placeholder="Enter Secret Admin Key"
                    {...register("adminSecret")}
                    className="w-full rounded-xl bg-slate-950/50 border border-white/5 px-4 py-2.5 text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:outline-none transition-all font-mono text-sm placeholder:text-slate-600"
                  />
                </div>
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
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Get Started"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center pt-8 border-t border-white/5">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{" "}
              <Link
                href="/auth/loginPage"
                className="text-indigo-400 font-bold hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
