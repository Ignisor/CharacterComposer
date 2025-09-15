import React from "react";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
}