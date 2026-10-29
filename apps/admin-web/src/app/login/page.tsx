'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    // Mock Auth logic
    console.log('Đăng nhập với email:', email);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setFeedback(`Đăng nhập giả lập thành công với email: ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl mb-3 shadow-md shadow-blue-500/20">
            GT
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Đăng nhập Admin</h1>
          <p className="text-sm text-slate-500 mt-1">
            Cổng quản trị chuỗi phòng tập Gym Tracker
          </p>
        </div>

        {feedback && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm text-center">
            {feedback}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            placeholder="admin@gymtracker.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Ghi nhớ đăng nhập
            </label>
            <span className="text-blue-600 hover:underline cursor-pointer">
              Quên mật khẩu?
            </span>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full mt-2">
            Đăng nhập
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-6">
          <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
