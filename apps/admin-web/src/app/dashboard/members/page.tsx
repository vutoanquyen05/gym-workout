import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getMembers, Membership } from './actions';
import { Users, UserPlus, UserCheck, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return {
        label: 'Đang hoạt động',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'expired':
      return {
        label: 'Đã hết hạn',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        dotClass: 'bg-red-500',
      };
    case 'pending_payment':
      return {
        label: 'Chờ thanh toán',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'paused':
      return {
        label: 'Tạm ngưng',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    case 'cancelled':
      return {
        label: 'Đã hủy',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}

export default async function MembersPage() {
  const { data: members, error } = await getMembers();

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
            <span className="font-medium text-slate-700">Vận hành & Tiếp tân</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Quản Lý Thẻ & Hội Viên CRM
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              CRM 360°
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Tra cứu hợp đồng thẻ tập, thời hạn hiệu lực, số buổi PT và trạng thái điểm danh hội viên.
          </p>
        </div>

        <Link
          href="/dashboard/members/create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs self-start sm:self-center"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Đăng ký hội viên mới</span>
        </Link>
      </div>

      {/* Alert Lỗi nếu truy vấn thất bại */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 overflow-hidden">
            <span className="font-semibold block text-red-800">
              Lỗi kết nối cơ sở dữ liệu Supabase:
            </span>
            <span className="font-mono text-xs break-words text-red-700 mt-1 block bg-red-100/60 p-2.5 rounded-lg border border-red-200">
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Danh sách Hội viên hoặc Empty State */}
      {members && members.length > 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">
              Danh sách thẻ hội viên ({members.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
                  <th className="py-3 px-5">Mã Hội viên</th>
                  <th className="py-3 px-5">Trạng thái</th>
                  <th className="py-3 px-5">Ngày bắt đầu</th>
                  <th className="py-3 px-5">Ngày kết thúc</th>
                  <th className="py-3 px-5">Số buổi còn lại</th>
                  <th className="py-3 px-5">Ngày tạo thẻ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {members.map((member: Membership) => {
                  const badge = getStatusBadge(member.status);

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span
                              className="font-mono text-xs font-semibold text-slate-900 block truncate max-w-[140px]"
                              title={member.qr_code_token || member.id}
                            >
                              {member.qr_code_token || `#${member.id.slice(0, 8)}`}
                            </span>
                            <span
                              className="text-[10px] text-slate-400 font-mono block truncate max-w-[140px]"
                              title={member.user_id}
                            >
                              UID: {member.user_id ? `${member.user_id.slice(0, 8)}...` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${badge.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {member.start_date
                          ? new Date(member.start_date).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {member.end_date
                          ? new Date(member.end_date).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : 'Vô thời hạn'}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-900">
                        {member.remaining_sessions !== null && member.remaining_sessions !== undefined
                          ? `${member.remaining_sessions} buổi`
                          : 'Không giới hạn'}
                      </td>
                      <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                        {member.created_at
                          ? new Date(member.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <Users className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            Chưa có hội viên nào trong hệ thống
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Dữ liệu hội viên sẽ được đồng bộ từ ứng dụng Mobile của học viên hoặc qua cổng đăng ký thẻ tập mới tại phòng gym.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/members/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm hội viên đầu tiên</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
