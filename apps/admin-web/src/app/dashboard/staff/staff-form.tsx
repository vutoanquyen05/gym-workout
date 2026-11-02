'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  StaffMember,
  BranchOption,
  StaffRole,
  StaffStatus,
  createStaffMember,
  updateStaffMember,
} from './actions';
import {
  ShieldCheck,
  Dumbbell,
  UserCheck,
  Building2,
  Phone,
  Mail,
  Award,
  Save,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Crown,
} from 'lucide-react';

interface StaffFormProps {
  initialStaff?: StaffMember;
  branches: BranchOption[];
  isEdit?: boolean;
}

export function StaffForm({ initialStaff, branches, isEdit = false }: StaffFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState(initialStaff?.full_name || '');
  const [phone, setPhone] = useState(initialStaff?.phone || '');
  const [email, setEmail] = useState(initialStaff?.email || '');
  const [role, setRole] = useState<StaffRole>(initialStaff?.role || 'trainer');
  const [branchId, setBranchId] = useState<string>(initialStaff?.branch_id || '');
  const [specialty, setSpecialty] = useState(initialStaff?.specialty || '');
  const [bio, setBio] = useState(initialStaff?.bio || '');
  const [status, setStatus] = useState<StaffStatus>(initialStaff?.status || 'active');

  // Gợi ý chuyên môn nhanh
  const specialtySuggestions = [
    'Tăng cơ - Giảm mỡ (Hypertrophy)',
    'Phục hồi chấn thương & Vận động',
    'Powerlifting & Sức mạnh',
    'Tư vấn dinh dưỡng thể thao',
    'Định hình vóc dáng nữ',
    'CSKH & Thu ngân POS',
    'Quản trị vận hành phòng gym',
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('role', role);
    formData.append('branch_id', branchId);
    formData.append('specialty', specialty);
    formData.append('bio', bio);
    formData.append('status', status);

    startTransition(async () => {
      if (isEdit && initialStaff) {
        const res = await updateStaffMember(initialStaff.id, formData);
        if (res?.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage('Đã cập nhật hồ sơ nhân sự thành công!');
          setTimeout(() => {
            router.push('/dashboard/staff');
            router.refresh();
          }, 800);
        }
      } else {
        const res = await createStaffMember(formData);
        if (res?.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage('Đã tạo hồ sơ nhân sự mới thành công!');
          setTimeout(() => {
            router.push('/dashboard/staff');
            router.refresh();
          }, 800);
        }
      }
    });
  };

  const selectedBranchName =
    branchId === ''
      ? 'Toàn hệ thống'
      : branches.find((b) => b.id === branchId)?.name || 'Chi nhánh đã chọn';

  const initials = (fullName || 'NV')
    .split(' ')
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Cột trái: Form nhập liệu thông minh (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {isEdit ? 'Chỉnh Sửa Hồ Sơ Nhân Sự' : 'Thông Tin Nhân Sự / Huấn Luyện Viên'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập thông tin cá nhân, phân quyền chi nhánh và hồ sơ chuyên môn PT
              </p>
            </div>
          </div>

          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Lỗi thao tác:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Thông báo thành công */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Thành công:</span>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
            {/* 1. Họ và tên */}
            <div>
              <label htmlFor="full_name" className="block font-medium text-slate-700 mb-1.5">
                Họ và tên nhân sự / PT <span className="text-rose-500">*</span>
              </label>
              <Input
                id="full_name"
                name="full_name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A, Lê Huỳnh B..."
                disabled={isPending}
                className="w-full text-xs sm:text-sm"
              />
            </div>

            {/* 2. SĐT & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block font-medium text-slate-700 mb-1.5">
                  Số điện thoại liên hệ
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0901234567"
                  disabled={isPending}
                  className="w-full text-xs sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-medium text-slate-700 mb-1.5">
                  Địa chỉ Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VD: hlv.nguyenvana@gym.vn"
                  disabled={isPending}
                  className="w-full text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* 3. Phân quyền vai trò (Role Selection) */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Vai trò nghiệp vụ trong phòng gym <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('trainer')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    role === 'trainer'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-xs">Huấn Luyện Viên PT</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Kèm cặp học viên, biên tập giáo án</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('receptionist')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    role === 'receptionist'
                      ? 'border-sky-600 bg-sky-50/50 text-sky-900 ring-1 ring-sky-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span className="font-semibold text-xs">Lễ Tân & Thu Ngân</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Quầy tiếp tân, điểm danh & bán thẻ</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('manager')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    role === 'manager'
                      ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-xs">Quản Lý Cơ Sở</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Điều phối cơ sở và đội ngũ nhân sự</p>
                </button>
              </div>
            </div>

            {/* 4. Chi nhánh làm việc & Trạng thái */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="branch_id" className="block font-medium text-slate-700 mb-1.5">
                  Chi nhánh phụ trách
                </label>
                <select
                  id="branch_id"
                  name="branch_id"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  disabled={isPending}
                  className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Toàn hệ thống (Mọi chi nhánh)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block font-medium text-slate-700 mb-1.5">
                  Trạng thái làm việc
                </label>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StaffStatus)}
                  disabled={isPending}
                  className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="active">Đang làm việc (active)</option>
                  <option value="invited">Chờ kích hoạt (invited)</option>
                  <option value="suspended">Tạm ngưng (suspended)</option>
                  <option value="revoked">Đã thu hồi quyền (revoked)</option>
                </select>
              </div>
            </div>

            {/* 5. Chuyên môn chính */}
            <div>
              <label htmlFor="specialty" className="block font-medium text-slate-700 mb-1.5">
                Chuyên môn đào tạo / Kỹ năng chuyên sâu
              </label>
              <Input
                id="specialty"
                name="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="VD: Tăng cơ, Phục hồi chấn thương, NASM Certified..."
                disabled={isPending}
                className="w-full text-xs sm:text-sm mb-2"
              />

              {/* Chips gợi ý chuyên môn nhanh */}
              <div className="flex flex-wrap gap-1.5">
                {specialtySuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSpecialty(item)}
                    className="px-2 py-0.5 text-[11px] rounded-md bg-slate-50 text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Tiểu sử & Kinh nghiệm */}
            <div>
              <label htmlFor="bio" className="block font-medium text-slate-700 mb-1.5">
                Tiểu sử & Giới thiệu kinh nghiệm (Bio)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="VD: 5 năm kinh nghiệm huấn luyện thể hình và tư vấn dinh dưỡng cho vận động viên..."
                disabled={isPending}
                className="w-full p-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link href="/dashboard/staff">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Hủy bỏ</span>
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isPending}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>
                  {isPending
                    ? 'Đang lưu...'
                    : isEdit
                    ? 'Lưu thay đổi'
                    : 'Tạo hồ sơ nhân sự'}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Cột phải: Live Staff Badge Preview (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Thẻ Nhân Sự Xem Trước (Live Staff Badge Preview)</span>
        </div>

        {/* Live Preview Card */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200/80 shadow-md p-6 relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Header thẻ: Avatar & Trạng thái */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-lg border border-indigo-200 shadow-2xs">
              {initials}
            </div>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : status === 'suspended'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : status === 'revoked'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === 'active'
                    ? 'bg-emerald-500'
                    : status === 'suspended'
                    ? 'bg-amber-500'
                    : status === 'revoked'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
              {status === 'active'
                ? 'Đang làm việc'
                : status === 'suspended'
                ? 'Tạm ngưng'
                : status === 'revoked'
                ? 'Đã thu hồi'
                : 'Chờ kích hoạt'}
            </span>
          </div>

          {/* Tên & Vai trò */}
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {fullName || 'Họ và Tên Nhân Sự'}
          </h3>

          <div className="mt-2 mb-4">
            {role === 'trainer' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Dumbbell className="w-3.5 h-3.5 text-indigo-600" />
                <span>Huấn Luyện Viên Cá Nhân (PT)</span>
              </span>
            ) : role === 'manager' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Quản Lý Cơ Sở Chi Nhánh</span>
              </span>
            ) : role === 'receptionist' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Lễ Tân & Quầy Thu Ngân</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Chủ Phòng Tập</span>
              </span>
            )}
          </div>

          {/* Thông tin chi tiết */}
          <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Cơ sở làm việc: <strong>{selectedBranchName}</strong></span>
            </div>

            {phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono">{phone}</span>
              </div>
            )}

            {email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-500">{email}</span>
              </div>
            )}

            {specialty && (
              <div className="flex items-start gap-2 pt-1">
                <Award className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-800">{specialty}</span>
              </div>
            )}
          </div>

          {bio && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-600 italic leading-relaxed">
              &ldquo;{bio}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

