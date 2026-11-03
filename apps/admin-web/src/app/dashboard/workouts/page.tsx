import React from 'react';
import Link from 'next/link';
import { Dumbbell, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WorkoutsPage() {
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
            <span className="font-medium text-slate-700">Dịch vụ & Giáo án</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Trạm Xếp Bài Tập & Giáo Án PT
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              3-Tier Coaching
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>Biên tập giáo án 3 tầng chuẩn khoa học</span>
            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
              Chương trình <ArrowRight className="w-3 h-3 text-slate-400" /> Ngày tập <ArrowRight className="w-3 h-3 text-slate-400" /> Bài tập chi tiết
            </span>
            <span>, phân công học viên và theo dõi InBody.</span>
          </p>
        </div>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Tổng quan</span>
          </Link>
        </div>
      </div>

      {/* Feature Preview Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200/70">
          <Dumbbell className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-base font-semibold text-slate-900">
            Trạm Giáo Án 3 Tầng & InBody Sẵn Sàng
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hạ tầng Database v2.0 (<code className="font-mono text-slate-700">workout_programs</code>, <code className="font-mono text-slate-700">program_days</code>, <code className="font-mono text-slate-700">program_day_exercises</code>, <code className="font-mono text-slate-700">body_measurements</code>) và RPC deep-clone <code className="font-mono text-slate-700">rpc_assign_program_template</code> đã sẵn sàng hoạt động. Giao diện trực quan sẽ được triển khai tại Phase P05.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>12 Bài tập Hệ thống Chuẩn</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Giáo án mẫu Push - Pull - Legs</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>RPC rpc_assign_program_template</span>
          </span>
        </div>
      </div>
    </div>
  );
}
