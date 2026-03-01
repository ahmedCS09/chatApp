"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Security updated successfully!");
        setStatus({
          type: "success",
          message: "Vault restocked! Redirecting to login...",
        });

        setTimeout(() => {
          router.push("/auth/loginPage");
        }, 2000);
      } else {
        toast.error(data.message || "Something went wrong.");
        setStatus({
          type: "error",
          message: data.message || "Something went wrong.",
        });
      }
    } catch (err) {
      toast.error("Process failed. Please try again.");
      setStatus({
        type: "error",
        message: "Server error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 pt-32 bg-[#020617] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">

        {/* Decorative Background Assets */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -z-10"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full -z-10"></div>

        <div className="relative z-10">
          {/* Brand Identity */}
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/20 transform hover:-rotate-3 transition-transform">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase italic">
              New Credentials
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
              Lock down your premium account
            </p>
          </div>

          {status.message && (
            <div
              className={`mb-8 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-2 duration-500 ${status.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                {status.type === "success" && <ShieldCheck className="w-4 h-4" />}
                {status.message}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                New Secure Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-2xl bg-slate-950/50 border border-white/5 px-5 py-4 text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600 font-medium font-mono"
              />
              <p className="text-[10px] font-medium text-slate-600 ml-1 italic">Minimum 6 high-entropy characters.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-all transform shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Securing...</span>
                </div>
              ) : "Seal Identity"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
