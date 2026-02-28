"use client";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Register() {
  const [isAdmin, setIsAdmin] = useState(false);
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

      if (response.status === 201) {
        toast.success("Registration successful!");
      } else {
        toast.error(response.data.message);
      }
      router.push("/auth/dashboardPage");
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 pt-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 p-10 shadow-2xl shadow-indigo-100/50">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4">
              <span className="text-white text-2xl font-bold">Chatty</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-slate-500 mt-2 font-medium italic">Join the Chatty community today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Full Name
                </label>
                <input
                  {...register("fullName")}
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-2xl bg-slate-50/50 border border-slate-200 px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs font-semibold ml-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="name@company.com"
                  className="w-full rounded-2xl bg-slate-50/50 border border-slate-200 px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs font-semibold ml-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl bg-slate-50/50 border border-slate-200 px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
              />
              {errors.password && (
                <p className="text-red-500 text-xs font-semibold ml-1">{errors.password.message}</p>
              )}
            </div>

            {/* Admin Toggle */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600 tracking-wide uppercase">Admin Access</span>
                <button
                  type="button"
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAdmin ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAdmin ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {isAdmin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    placeholder="Enter Secret Admin Key"
                    {...register("adminSecret")}
                    className="w-full rounded-xl bg-white border border-slate-200 px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-mono text-sm"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl py-4 text-white font-bold text-lg transition-all transform shadow-xl ${loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] shadow-indigo-100"
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
          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-600 font-medium">
              Already have an account?{" "}
              <Link
                href="/auth/loginPage"
                className="text-indigo-600 font-extrabold hover:text-indigo-700 transition-colors"
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
