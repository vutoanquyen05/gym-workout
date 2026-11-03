'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from './actions';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setErrorMessage(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200/80">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl mb-3 shadow-md shadow-indigo-500/20">
            G
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Đăng nhập GymOS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hệ thống quản trị phòng tập đa chi nhánh
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email quản trị"
            name="email"
            type="email"
            placeholder="admin@gymos.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Mật khẩu"
            name="password"
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
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <span className="text-indigo-600 hover:underline cursor-pointer font-medium">
              Quên mật khẩu?
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isPending}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 h-11 text-sm font-semibold rounded-xl"
          >
            Đăng nhập hệ thống
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại cổng thông tin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
