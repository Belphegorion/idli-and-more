'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TempleBorder } from '@/components/CulturalMotifs';
import { Lock, Mail, Shield, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials. Please verify and try again.');
        setIsLoading(false);
        return;
      }

      // If user is staff, redirect to availability, otherwise to admin dashboard
      if (data.user?.role === 'staff') {
        router.push('/admin/availability');
      } else {
        router.push('/admin');
      }
      router.refresh();
    } catch (err: any) {
      setError('Connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EC] flex flex-col justify-between text-[#2B1D14]">
      <TempleBorder variant="green" />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FFFDF7] rounded-3xl border border-[#E8DCC4] p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#2F5D3A] text-[#FAF6EC] flex items-center justify-center font-serif font-bold text-xl mx-auto shadow-sm">
              i&m
            </div>
            <h1 className="font-serif font-bold text-2xl text-[#2B1D14]">
              Kitchen & Owner Sign In
            </h1>
            <p className="text-xs text-[#6B5444]">
              Idli & More · Authorized Management Console (Bhopal)
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-[#B3261E]/10 border border-[#B3261E]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#B3261E] font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2B1D14] mb-1.5">
                Staff / Owner Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B5444] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="owner@idliandmore.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-xs text-[#2B1D14] focus:outline-hidden focus:ring-2 focus:ring-[#2F5D3A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B1D14] mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B5444] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-xs text-[#2B1D14] focus:outline-hidden focus:ring-2 focus:ring-[#2F5D3A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#2F5D3A] hover:bg-[#1F3F28] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Management Desk'}
            </button>
          </form>

          {/* Notice */}
          <div className="pt-2 border-t border-[#E8DCC4] text-center space-y-1">
            <p className="text-[11px] text-[#6B5444]">
              Rate-limited to 5 attempts per 15 minutes per IP address.
            </p>
            <p className="text-[10px] text-[#6B5444]/70">
              Need access? Contact the primary owner to issue a staff invite.
            </p>
          </div>

        </div>
      </main>

      <div className="py-4 text-center text-xs text-[#6B5444]">
        Idli & More · Bhopal
      </div>
    </div>
  );
}
