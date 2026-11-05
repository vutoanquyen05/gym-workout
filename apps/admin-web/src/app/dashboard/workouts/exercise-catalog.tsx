'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  Dumbbell,
  Search,
  Plus,
  ShieldCheck,
  Sparkles,
  Activity,
  Layers,
  ArrowRight,
  BookOpen,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ExerciseCatalogData,
  ExerciseItem,
  createCustomExercise,
  updateCustomExercise,
  deleteCustomExercise,
} from './actions';

interface ExerciseCatalogProps {
  initialData: ExerciseCatalogData;
}

export function ExerciseCatalog({ initialData }: ExerciseCatalogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Bộ lọc dữ liệu
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<'all' | 'system' | 'gym'>('all');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null);

  // Danh sách các nhóm cơ phổ biến
  const muscleGroups = [
    { id: 'all', label: 'Tất cả nhóm cơ' },
    { id: 'chest', label: 'Ngực (Chest)' },
    { id: 'back', label: 'Lưng (Back)' },
    { id: 'legs', label: 'Chân và mông (Legs)' },
    { id: 'shoulders', label: 'Vai (Shoulders)' },
    { id: 'arms', label: 'Tay (Arms)' },
    { id: 'core', label: 'Bụng và liên sườn (Core)' },
    { id: 'full_body', label: 'Toàn thân (Full Body)' },
  ];

  // Danh sách thiết bị
  const equipmentOptions = [
    { id: 'all', label: 'Tất cả dụng cụ' },
    { id: 'barbell', label: 'Tạ đòn (Barbell)' },
    { id: 'dumbbell', label: 'Tạ đơn (Dumbbell)' },
    { id: 'machine', label: 'Máy khối (Machine)' },
    { id: 'cable', label: 'Dây cáp (Cable)' },
    { id: 'bodyweight', label: 'Trọng lượng cơ thể (Bodyweight)' },
    { id: 'other', label: 'Khác' },
  ];

  // Lọc danh sách bài tập theo các tiêu chí
  const filteredExercises = React.useMemo(() => {
    return initialData.exercises.filter((ex) => {
      // 1. Tìm kiếm từ khóa
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = ex.name.toLowerCase().includes(q);
        const matchMuscle = ex.primary_muscle_group.toLowerCase().includes(q);
        const matchEquip = ex.equipment?.toLowerCase().includes(q);
        if (!matchName && !matchMuscle && !matchEquip) return false;
      }

      // 2. Lọc theo nhóm cơ
      if (selectedMuscle !== 'all') {
        const muscleLower = ex.primary_muscle_group.toLowerCase();
        if (selectedMuscle === 'chest' && !muscleLower.includes('ngực') && !muscleLower.includes('chest')) return false;
        if (selectedMuscle === 'back' && !muscleLower.includes('lưng') && !muscleLower.includes('back')) return false;
        if (selectedMuscle === 'legs' && !muscleLower.includes('chân') && !muscleLower.includes('mông') && !muscleLower.includes('leg') && !muscleLower.includes('quad') && !muscleLower.includes('hamstring') && !muscleLower.includes('glute')) return false;
        if (selectedMuscle === 'shoulders' && !muscleLower.includes('vai') && !muscleLower.includes('shoulder') && !muscleLower.includes('delt')) return false;
        if (selectedMuscle === 'arms' && !muscleLower.includes('tay') && !muscleLower.includes('bicep') && !muscleLower.includes('tricep') && !muscleLower.includes('arm')) return false;
        if (selectedMuscle === 'core' && !muscleLower.includes('bụng') && !muscleLower.includes('core') && !muscleLower.includes('abs')) return false;
        if (selectedMuscle === 'full_body' && !muscleLower.includes('toàn thân') && !muscleLower.includes('full')) return false;
      }

      // 3. Lọc theo dụng cụ
      if (selectedEquipment !== 'all') {
        const equipLower = (ex.equipment || '').toLowerCase();
        if (selectedEquipment === 'barbell' && !equipLower.includes('barbell') && !equipLower.includes('tạ đòn')) return false;
        if (selectedEquipment === 'dumbbell' && !equipLower.includes('dumbbell') && !equipLower.includes('tạ đơn')) return false;
        if (selectedEquipment === 'machine' && !equipLower.includes('machine') && !equipLower.includes('máy')) return false;
        if (selectedEquipment === 'cable' && !equipLower.includes('cable') && !equipLower.includes('cáp')) return false;
        if (selectedEquipment === 'bodyweight' && !equipLower.includes('bodyweight') && !equipLower.includes('tự thân') && !equipLower.includes('cơ thể')) return false;
        if (selectedEquipment === 'other' && (equipLower.includes('barbell') || equipLower.includes('dumbbell') || equipLower.includes('machine') || equipLower.includes('cable') || equipLower.includes('bodyweight'))) return false;
      }

      // 4. Lọc theo độ khó
      if (selectedDifficulty !== 'all') {
        if (ex.difficulty !== selectedDifficulty) return false;
      }

      // 5. Lọc theo nguồn (scope)
      if (selectedScope !== 'all') {
        if (ex.scope !== selectedScope) return false;
      }

      return true;
    });
  }, [
    initialData.exercises,
    searchQuery,
    selectedMuscle,
    selectedEquipment,
    selectedDifficulty,
    selectedScope,
  ]);

  // Submit tạo bài tập mới
  const handleCreateExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createCustomExercise(formData);
      if (res.success) {
        toast.success('Đã thêm bài tập mới vào thư viện phòng gym thành công!');
        setIsCreateOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể tạo bài tập mới.');
      }
    });
  };

  // Submit cập nhật bài tập
  const handleUpdateExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingExercise) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await updateCustomExercise(editingExercise.id, formData);
      if (res.success) {
        toast.success('Đã cập nhật bài tập thành công!');
        setEditingExercise(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể cập nhật bài tập.');
      }
    });
  };

  // Xóa / Lưu trữ bài tập
  const handleDeleteExercise = async (exerciseId: string, exerciseName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn lưu trữ bài tập "${exerciseName}" không?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCustomExercise(exerciseId);
      if (res.success) {
        toast.success('Đã chuyển bài tập vào kho lưu trữ!');
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể xóa bài tập.');
      }
    });
  };

  // Helper format độ khó
  const renderDifficultyBadge = (difficulty?: string | null) => {
    switch (difficulty) {
      case 'beginner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Cơ bản
          </span>
        );
      case 'advanced':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Nâng cao
          </span>
        );
      case 'intermediate':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Trung bình
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Thẻ KPI Thư viện Bài tập */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng số bài tập</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {initialData.stats.totalExercises}
            </span>
            <span className="text-xs text-slate-400">bài tập</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bài tập chuẩn GymOS</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 tabular-nums">
              {initialData.stats.systemExercises}
            </span>
            <span className="text-xs text-slate-400">hệ thống</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bài tập riêng phòng gym</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
              {initialData.stats.gymExercises}
            </span>
            <span className="text-xs text-slate-400">tùy biến</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nhóm cơ bao phủ</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-violet-600 tabular-nums">
              {initialData.stats.muscleGroupsCount}
            </span>
            <span className="text-xs text-slate-400">vùng vận động</span>
          </div>
        </div>
      </div>

      {/* Thanh Công Cụ Lọc Nâng Cao & Nút Thêm Mới */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Ô tìm kiếm từ khóa */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài tập, nhóm cơ, dụng cụ..."
              className="w-full h-10 pl-10 pr-4 rounded-lg text-xs border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Nút Thêm Bài Tập Mới (Mở Radix Dialog) */}
          <Dialog.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <Dialog.Trigger asChild>
              <Button
                type="button"
                className="h-10 px-5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm bài tập mới</span>
              </Button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 animate-in fade-in duration-150" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-6 space-y-5 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                    <Dumbbell className="w-4 h-4 text-indigo-600" />
                    <span>Thêm bài tập riêng cho phòng gym</span>
                  </div>
                  <Dialog.Close asChild>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <form onSubmit={handleCreateExercise} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Tên bài tập <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="VD: Dumbbell Bulgarian Split Squat..."
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Nhóm cơ chính <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="primary_muscle_group"
                        required
                        placeholder="VD: Đùi trước, Ngực, Lưng xô..."
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Dụng cụ tập luyện
                      </label>
                      <input
                        type="text"
                        name="equipment"
                        placeholder="VD: Tạ đơn, Máy Smith, Dây kháng lực..."
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Cấp độ khó
                    </label>
                    <select
                      name="difficulty"
                      defaultValue="intermediate"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    >
                      <option value="beginner">Cơ bản (Người mới bắt đầu)</option>
                      <option value="intermediate">Trung bình (Đã có kinh nghiệm)</option>
                      <option value="advanced">Nâng cao (Chuyên sâu)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Hướng dẫn kỹ thuật và lưu ý an toàn
                    </label>
                    <textarea
                      name="instructions"
                      rows={4}
                      placeholder="Ghi chú tư thế chuẩn bị, nhịp thở, quỹ đạo chuyển động và các lỗi sai cần tránh..."
                      className="w-full p-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="h-10 px-4 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </Dialog.Close>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="h-10 px-5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    >
                      {isPending ? 'Đang lưu...' : 'Lưu vào thư viện'}
                    </Button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {/* Dải Tabs chọn Nhóm Cơ Nhanh */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
          {muscleGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedMuscle(group.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap',
                selectedMuscle === group.id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {group.label}
            </button>
          ))}
        </div>

        {/* Bộ lọc Dụng cụ, Độ khó và Nguồn gốc */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Dụng cụ tập luyện
            </label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              {equipmentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Cấp độ thực hiện
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tất cả độ khó</option>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung bình</option>
              <option value="advanced">Nâng cao</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Phân loại nguồn bài tập
            </label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value as 'all' | 'system' | 'gym')}
              className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tất cả nguồn bài tập</option>
              <option value="system">Chuẩn GymOS (Hệ thống)</option>
              <option value="gym">Riêng phòng gym</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lưới Thẻ Bài Tập (Exercise Cards Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3 shadow-xs">
            <Dumbbell className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-semibold text-slate-700">
              Không tìm thấy bài tập nào phù hợp
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Thử xóa bớt bộ lọc hoặc thêm bài tập mới vào thư viện riêng của phòng gym.
            </p>
          </div>
        ) : (
          filteredExercises.map((exercise) => {
            const isSystem = exercise.scope === 'system';

            return (
              <div
                key={exercise.id}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Badge Scope & Difficulty */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border',
                        isSystem
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      )}
                    >
                      {isSystem ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          <span>Chuẩn GymOS</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>Phòng gym</span>
                        </>
                      )}
                    </span>

                    {renderDifficultyBadge(exercise.difficulty)}
                  </div>

                  {/* Exercise Title */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {exercise.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {exercise.primary_muscle_group}
                      </span>
                      {exercise.equipment && (
                        <span className="text-slate-500 font-medium">
                          • {exercise.equipment}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Excerpt Instructions */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {exercise.instructions || 'Chưa có mô tả kỹ thuật chi tiết.'}
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedExercise(exercise)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Chi tiết kỹ thuật</span>
                  </button>

                  {!isSystem && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingExercise(exercise)}
                        className="w-7 h-7 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
                        title="Chỉnh sửa bài tập"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExercise(exercise.id, exercise.name)}
                        className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center"
                        title="Lưu trữ bài tập"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: XEM CHI TIẾT KỸ THUẬT BÀI TẬP */}
      <Dialog.Root open={!!selectedExercise} onOpenChange={(open) => !open && setSelectedExercise(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 animate-in fade-in duration-150" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {selectedExercise && (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border',
                        selectedExercise.scope === 'system'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      )}
                    >
                      {selectedExercise.scope === 'system' ? 'Chuẩn GymOS' : 'Riêng phòng gym'}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 truncate">
                      {selectedExercise.name}
                    </h3>
                  </div>
                  <Dialog.Close asChild>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Nhóm cơ chính</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {selectedExercise.primary_muscle_group}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Dụng cụ chỉ định</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {selectedExercise.equipment || 'Không yêu cầu dụng cụ'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Cấp độ thực hiện</span>
                      <span className="font-semibold text-slate-800 text-xs capitalize">
                        {selectedExercise.difficulty === 'beginner'
                          ? 'Cơ bản'
                          : selectedExercise.difficulty === 'advanced'
                          ? 'Nâng cao'
                          : 'Trung bình'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Trạng thái dữ liệu</span>
                      <span className="font-semibold text-emerald-600 text-xs">
                        Đang áp dụng trong giáo án
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Hướng dẫn kỹ thuật và quy chuẩn thực hiện</span>
                    </h4>
                    <div className="p-4 rounded-xl border border-slate-200/90 bg-white text-slate-700 leading-relaxed whitespace-pre-line text-xs font-normal">
                      {selectedExercise.instructions || 'Chưa có thông tin hướng dẫn chi tiết.'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end border-t border-slate-100">
                  <Dialog.Close asChild>
                    <Button
                      type="button"
                      className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Đóng
                    </Button>
                  </Dialog.Close>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* MODAL 2: CHỈNH SỬA BÀI TẬP RIÊNG */}
      <Dialog.Root open={!!editingExercise} onOpenChange={(open) => !open && setEditingExercise(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 animate-in fade-in duration-150" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {editingExercise && (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                    <Edit2 className="w-4 h-4 text-indigo-600" />
                    <span>Chỉnh sửa bài tập riêng phòng gym</span>
                  </div>
                  <Dialog.Close asChild>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <form onSubmit={handleUpdateExercise} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Tên bài tập <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingExercise.name}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Nhóm cơ chính <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="primary_muscle_group"
                        required
                        defaultValue={editingExercise.primary_muscle_group}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Dụng cụ tập luyện
                      </label>
                      <input
                        type="text"
                        name="equipment"
                        defaultValue={editingExercise.equipment || ''}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Cấp độ khó
                    </label>
                    <select
                      name="difficulty"
                      defaultValue={editingExercise.difficulty || 'intermediate'}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
                    >
                      <option value="beginner">Cơ bản (Người mới bắt đầu)</option>
                      <option value="intermediate">Trung bình (Đã có kinh nghiệm)</option>
                      <option value="advanced">Nâng cao (Chuyên sâu)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Hướng dẫn kỹ thuật và lưu ý an toàn
                    </label>
                    <textarea
                      name="instructions"
                      rows={4}
                      defaultValue={editingExercise.instructions || ''}
                      className="w-full p-3 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="h-10 px-4 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </Dialog.Close>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="h-10 px-5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    >
                      {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

