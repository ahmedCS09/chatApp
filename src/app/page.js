"use client";

import Link from "next/link";
import { MessageCircle, Users, Zap, Shield, ArrowRight, Github, Mail, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Hero Section with Mesh Gradient */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950/0 to-transparent -z-10"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full -z-10 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div className="animate-in fade-in slide-in-from-top-10 duration-1000">
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-indigo-400 text-sm font-black tracking-widest uppercase">
              <Zap className="w-4 h-4" />
              Next-Gen Messaging
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-top-12 duration-1000 delay-100">
            Experience the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-300% animate-gradient">Evolution of Chat.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in duration-1000 delay-300">
            Modern. Instant. Beautiful. Chatty redefines how you connect with your community through a high-performance, real-time interface.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <Link href="/auth/registerPage">
              <button className="group px-10 py-5 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg transition-all shadow-2xl shadow-indigo-500/20 flex items-center gap-3 hover:-translate-y-1">
                Get Started
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/auth/loginPage">
              <button className="px-10 py-5 rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:bg-slate-800 text-slate-300 font-black text-lg transition-all backdrop-blur-xl">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-slate-900/50">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Engineered for Connection</h2>
          <p className="text-slate-500 font-medium text-lg">Everything you need in a modern messenger.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard
            icon={<Zap className="text-yellow-400" />}
            title="Real-time Engine"
            desc="Built on a high-throughput socket architecture for guaranteed sub-millisecond delivery."
          />
          <FeatureCard
            icon={<Users className="text-indigo-400" />}
            title="Social Graph"
            desc="Intuitive friend management and community discovery tools to grow your network."
          />
          <FeatureCard
            icon={<Shield className="text-emerald-400" />}
            title="Secure Layers"
            desc="Enterprise-grade security protocols ensuring your private conversations stay private."
          />
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-slate-900/30 py-32 border-y border-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatItem label="Active Users" value="10k+" />
            <StatItem label="Daily Chats" value="500k+" />
            <StatItem label="Global Uptime" value="99.9%" />
            <StatItem label="Latency" value="< 2ms" />
          </div>
        </div>
      </section>

      {/* Dark Premium Footer */}
      <footer className="bg-slate-950 pt-32 pb-12 border-t border-slate-900/50 overflow-hidden relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/5 via-slate-950/0 to-transparent -z-10"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 mb-24">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter">CHATTY</span>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                The future of digital connection. Beautiful, fast, and secure messaging for everyone.
              </p>
              <div className="flex gap-4">
                <SocialButton icon={<Github className="w-5 h-5" />} />
                <SocialButton icon={<Mail className="w-5 h-5" />} />
              </div>
            </div>

            <FooterColumn title="Platform" links={["Features", "Enterprise", "Security"]} />
            <FooterColumn title="Resources" links={["Documentation", "API Status", "Dev Blog"]} />
            <FooterColumn title="Support" links={["Help Center", "Community", "Safety"]} />
          </div>

          <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-600 text-sm font-bold">© 2026 CHATTY INC. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-10 text-slate-600 text-sm font-bold">
              <Link href="#" className="hover:text-indigo-400 transition-colors uppercase">Privacy</Link>
              <Link href="#" className="hover:text-indigo-400 transition-colors uppercase">Terms</Link>
              <div className="flex items-center gap-2">
                <span>MADE WITH</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components for modern landing
const FeatureCard = ({ icon, title, desc }) => (
  <div className="group p-10 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 transform hover:-translate-y-2">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
      <div className="w-8 h-8">{icon}</div>
    </div>
    <h3 className="text-2xl font-black mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-400 font-medium leading-relaxed">{desc}</p>
  </div>
);

const StatItem = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-5xl font-black text-white tracking-tighter">{value}</p>
    <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">{label}</p>
  </div>
);

const FooterColumn = ({ title, links }) => (
  <div className="space-y-6">
    <h4 className="text-slate-100 font-black text-sm uppercase tracking-widest">{title}</h4>
    <ul className="space-y-4">
      {links.map(link => (
        <li key={link}>
          <Link href="#" className="text-slate-600 hover:text-indigo-400 font-bold text-sm transition-colors">{link}</Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialButton = ({ icon }) => (
  <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white hover:border-slate-700 transition-all shadow-xl">
    {icon}
  </button>
);


