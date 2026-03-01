'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function UpdateUserModal({ open, close }) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        image: ""
    });
    const [loading, setLoading] = useState(false);

    // Using useEffect to prevent the "if" statement re-render loop
    useEffect(() => {
        if (open) {
            fetchUserData();
        }
    }, [open]);

    const fetchUserData = async () => {
        try {
            const { data } = await axios.get("/api/auth/getUser");
            if (data?.user) {
                setFormData({
                    fullName: data.user.fullName || "",
                    email: data.user.email || "",
                    image: data.user.image || ""
                });
            }
        } catch (e) {
            console.error("Failed to fetch user data", e);
        }
    };

    const updateUser = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.image;

            if (formData.image instanceof File) {
                const uploadData = new FormData();
                uploadData.append("file", formData.image);

                const uploadRes = await axios.post("/api/auth/upload", uploadData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                imageUrl = uploadRes?.data?.url;
            }

            await axios.put("/api/auth/updateUser", {
                fullName: formData.fullName,
                email: formData.email,
                image: imageUrl
            });

            toast.success("Profile updated successfully!");
            setTimeout(() => {
                close();
                window.location.reload();
            }, 1000);

        } catch (err) {
            console.error("Update failed", err);
            toast.error("Update failed: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl flex items-center justify-center z-[110] p-6 animate-in fade-in duration-300">
            <div className="bg-slate-900/50 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-2xl w-full max-w-lg border border-white/5 animate-in zoom-in-95 duration-500 max-h-[95vh] overflow-y-auto custom-scrollbar relative">

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Update Profile</h1>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] leading-none">Security & Transparency</p>
                    </div>
                    <button onClick={close} className="p-3 bg-slate-950/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-[1.25rem] transition-all hover:rotate-90 border border-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={updateUser} className="space-y-10">
                    {/* High-End Avatar Editor */}
                    <div className="bg-slate-950/30 p-8 rounded-[3rem] border border-white/5 flex flex-col items-center gap-6 group hover:bg-white/5 transition-all duration-500">
                        <div className="relative">
                            <div className="w-36 h-36 rounded-[3rem] bg-indigo-600 flex items-center justify-center p-1.5 shadow-2xl shadow-indigo-500/20 ring-8 ring-indigo-500/10 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 ease-out overflow-hidden">
                                {formData.image ? (
                                    <img
                                        src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image}
                                        alt="ProfilePreview"
                                        className="w-full h-full rounded-[2.5rem] object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl font-black text-white">
                                        {formData.fullName?.charAt(0).toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-indigo-600 border-4 border-[#020617] rounded-2xl shadow-xl flex items-center justify-center text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </div>
                        </div>

                        <label className="cursor-pointer bg-white text-slate-950 px-8 py-3.5 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black hover:bg-indigo-500 hover:text-white shadow-xl transition-all border-0 active:scale-95">
                            Select New Media
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setFormData({ ...formData, image: e.target.files[0] });
                                    }
                                }}
                            />
                        </label>
                    </div>

                    {/* Inputs Matrix */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2 leading-none">Legal Identity</label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full rounded-2xl border border-white/5 px-6 py-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:outline-none transition-all bg-slate-950/50 font-bold text-white placeholder:text-slate-600"
                                placeholder="FullName"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2 leading-none">Security Anchor</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-2xl border border-white/5 px-6 py-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:outline-none transition-all bg-slate-950/50 font-bold text-white placeholder:text-slate-600"
                                placeholder="Email@domain.com"
                            />
                        </div>
                    </div>

                    {/* Matrix Control Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={close}
                            className="flex-1 px-8 py-5 rounded-3xl border border-white/5 text-slate-500 hover:text-white hover:bg-slate-800 font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] px-12 py-5 rounded-3xl bg-indigo-600 text-white hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Syncing...
                                </span>
                            ) : "Commit Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
