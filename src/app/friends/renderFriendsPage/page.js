"use client";

import RenderFriends from "@/app/components/renderFriends.js";

export default function FriendsPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed ">
            <div className="max-w-7xl mx-auto">
                <RenderFriends />
            </div>
        </div>
    );
}