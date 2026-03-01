"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { MessageCircle, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSubmitted(true);
      setEmail("");
      toast.success("Reset link sent if account exists");
    } catch (err) {
      toast.error("Process failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 pt-32 bg-[#020617] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">

        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -z-10"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full -z-10"></div>

        <div className="relative z-10">
          {/* Logo/Icon */}
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/20 transform hover:rotate-6 transition-transform">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase italic">
              Reset Security
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
              Restore your premium access
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-white mb-2 uppercase italic">Email Dispatched</h2>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                If an account exists for {email}, a recovery link has been sent to your secure inbox.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-8 text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                Try different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950/50 border border-white/5 px-5 py-4 text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-all transform shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Generating Link..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center pt-8 border-t border-white/5">
            <Link
              href="/auth/loginPage"
              className="inline-flex items-center gap-2 text-sm text-slate-500 font-bold hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
