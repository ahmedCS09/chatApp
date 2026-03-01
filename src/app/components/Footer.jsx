import Link from "next/link";
import { MessageCircle, Heart, Github, Mail } from "lucide-react";

const Footer = () => {
    return (
        <footer className="relative bg-slate-950/80 backdrop-blur-md border-t border-white/5 py-12 px-6 overflow-hidden">
            {/* Mesh Gradient Highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950/0 to-transparent -z-10"></div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Branding Section */}
                <div className="flex flex-col items-center md:items-start space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg group-hover:rotate-6 transition-transform">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white italic">CHATTY.</span>
                    </div>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] max-w-xs text-center md:text-left">
                        Experience the evolution of digital connection.
                    </p>
                </div>

                {/* Info Links Section */}
                <div className="flex flex-wrap justify-center gap-8 text-slate-400 font-black uppercase text-[10px] tracking-widest leading-relaxed">
                    <Link href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
                    <Link href="#" className="hover:text-indigo-400 transition-colors">Safety Center</Link>
                    <Link href="#" className="hover:text-indigo-400 transition-colors">API Status</Link>
                </div>

                {/* Right Aligned Metadata */}
                <div className="flex flex-col items-center md:items-end gap-3 order-first md:order-last w-full md:w-auto">
                    <div className="flex gap-4 mb-2">
                        <button className="p-3 bg-slate-900/50 border border-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all shadow-xl">
                            <Github className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-slate-900/50 border border-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all shadow-xl">
                            <Mail className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Final Copyright */}
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
                    © 2026 CHATTY INC. ALL RIGHTS RESERVED.
                </p>
                <div className="flex items-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                    <span>Engineered with </span>
                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                    <span> by AhmedCS09</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;