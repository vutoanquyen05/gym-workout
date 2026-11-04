import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Dumbbell } from 'lucide-react';
import { getExercisesCatalogData } from './actions';
import { ExerciseCatalog } from './exercise-catalog';

export const dynamic = 'force-dynamic';

export default async function WorkoutsPage() {
  const catalogData = await getExercisesCatalogData();

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Enterprise Page Header (Không đóng hộp) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
              Tổng quan
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Dịch vụ và giáo án</span>
            <span>/</span>
            <span className="font-medium text-slate-700">Thư viện bài tập</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Thư viện bài tập chuẩn và cá nhân hóa
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Tầng 1 — Thư viện bài tập
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Danh mục bài tập kỹ thuật chuẩn khoa học làm tiền đề thiết kế giáo án và xếp lịch tập luyện cho hội viên.
          </p>
        </div>

        {/* 2 Nút thao tác trên cùng bên phải */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Về tổng quan</span>
          </Link>

          <Link
            href="/dashboard/members/create"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng ký hội viên</span>
          </Link>
        </div>
      </div>

      {/* Main Exercise Catalog Interactive Component */}
      <ExerciseCatalog initialData={catalogData} />
    </div>
  );
}
