'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  Dumbbell,
  Layers,
  Users,
  Search,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Activity,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronRight,
  Flame,
  Scale,
  Sparkles,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExerciseCatalog } from './exercise-catalog';
import {
  WorkoutStudioFullData,
  WorkoutProgramItem,
  ProgramDayItem,
  ProgramDayExerciseItem,
  ExerciseItem,
  GymMemberSimple,
  GymStaffSimple,
  createProgramTemplate,
  deleteProgramTemplate,
  addProgramDay,
  deleteProgramDay,
  addExerciseToProgramDay,
  removeExerciseFromProgramDay,
  assignProgramToMember,
  updateAssignedProgramStatus,
  deleteAssignedProgram,
} from './actions';

interface WorkoutStudioProps {
  initialData: WorkoutStudioFullData;
}

export function WorkoutStudio({ initialData }: WorkoutStudioProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<string>('templates');

  // ===========================================================================
  // TẦNG 2 STATES: PROGRAM TEMPLATES BUILDER
  // ===========================================================================
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateDifficultyFilter, setTemplateDifficultyFilter] = useState('all');
  const [activeEditingTemplateId, setActiveEditingTemplateId] = useState<string | null>(null);

  // Dialogs Tầng 2
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isAddDayOpen, setIsAddDayOpen] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [targetDayForExercise, setTargetDayForExercise] = useState<ProgramDayItem | null>(null);
  const [exerciseSearchInModal, setExerciseSearchInModal] = useState('');

  // ===========================================================================
  // TẦNG 3 STATES: ASSIGNED PROGRAMS & PERSONALIZATION
  // ===========================================================================
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [assignedStatusFilter, setAssignedStatusFilter] = useState('all');

  // Dialogs Tầng 3
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [preSelectedTemplateId, setPreSelectedTemplateId] = useState<string | null>(null);
  const [viewingAssignedProgram, setViewingAssignedProgram] = useState<WorkoutProgramItem | null>(null);

  // ===========================================================================
  // COMPUTED / FILTERED DATA
  // ===========================================================================
  const filteredTemplates = useMemo(() => {
    return initialData.templates.filter((tpl) => {
      const matchQuery =
        tpl.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        (tpl.description && tpl.description.toLowerCase().includes(templateSearchQuery.toLowerCase()));
      const matchDifficulty =
        templateDifficultyFilter === 'all' ||
        (tpl.difficulty_level && tpl.difficulty_level.toLowerCase() === templateDifficultyFilter.toLowerCase());
      return matchQuery && matchDifficulty;
    });
  }, [initialData.templates, templateSearchQuery, templateDifficultyFilter]);

  const activeEditingTemplate = useMemo(() => {
    if (!activeEditingTemplateId) return null;
    return initialData.templates.find((t) => t.id === activeEditingTemplateId) || null;
  }, [initialData.templates, activeEditingTemplateId]);

  const filteredAssignedPrograms = useMemo(() => {
    return initialData.assignedPrograms.filter((prog) => {
      const memberName = prog.member?.full_name?.toLowerCase() || '';
      const memberCode = prog.member?.member_code?.toLowerCase() || '';
      const progTitle = prog.title.toLowerCase();
      const q = assignedSearchQuery.toLowerCase();
      const matchQuery = memberName.includes(q) || memberCode.includes(q) || progTitle.includes(q);

      const matchStatus = assignedStatusFilter === 'all' || prog.status === assignedStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [initialData.assignedPrograms, assignedSearchQuery, assignedStatusFilter]);

  // Bộ lọc bài tập trong Modal thêm bài tập
  const availableExercisesForModal = useMemo(() => {
    if (!exerciseSearchInModal.trim()) return initialData.catalog.exercises;
    const q = exerciseSearchInModal.toLowerCase();
    return initialData.catalog.exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.primary_muscle_group.toLowerCase().includes(q) ||
        (ex.equipment && ex.equipment.toLowerCase().includes(q))
    );
  }, [initialData.catalog.exercises, exerciseSearchInModal]);

  // ===========================================================================
  // HANDLERS: TẦNG 2
  // ===========================================================================

  const handleCreateTemplateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createProgramTemplate(formData);
      if (res.success) {
        toast.success('Đã tạo giáo án mẫu mới thành công.');
        setIsCreateTemplateOpen(false);
        if (res.program?.id) {
          setActiveEditingTemplateId(res.program.id);
        }
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể tạo giáo án mẫu.');
      }
    });
  };

  const handleDeleteTemplate = (templateId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa giáo án mẫu "${title}" không? Toàn bộ các buổi tập bên trong sẽ bị xóa.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteProgramTemplate(templateId);
      if (res.success) {
        toast.success(`Đã xóa giáo án mẫu "${title}".`);
        if (activeEditingTemplateId === templateId) {
          setActiveEditingTemplateId(null);
        }
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể xóa giáo án mẫu.');
      }
    });
  };

  const handleAddDaySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeEditingTemplateId) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addProgramDay(activeEditingTemplateId, formData);
      if (res.success) {
        toast.success('Đã thêm buổi tập mới vào giáo án.');
        setIsAddDayOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể thêm buổi tập.');
      }
    });
  };

  const handleDeleteDay = (dayId: string, dayName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${dayName}" không?`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteProgramDay(dayId);
      if (res.success) {
        toast.success(`Đã xóa buổi tập "${dayName}".`);
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể xóa buổi tập.');
      }
    });
  };

  const handleAddExerciseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!targetDayForExercise) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addExerciseToProgramDay(targetDayForExercise.id, formData);
      if (res.success) {
        toast.success('Đã thêm bài tập vào buổi tập thành công.');
        setIsAddExerciseOpen(false);
        setTargetDayForExercise(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể thêm bài tập vào buổi tập.');
      }
    });
  };

  const handleRemoveExercise = (itemId: string, exerciseName: string) => {
    if (!window.confirm(`Xóa bài tập "${exerciseName}" khỏi buổi tập này?`)) {
      return;
    }
    startTransition(async () => {
      const res = await removeExerciseFromProgramDay(itemId);
      if (res.success) {
        toast.success(`Đã xóa bài tập "${exerciseName}".`);
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể xóa bài tập.');
      }
    });
  };

  // ===========================================================================
  // HANDLERS: TẦNG 3
  // ===========================================================================

  const handleOpenAssignModal = (templateId?: string) => {
    setPreSelectedTemplateId(templateId || (initialData.templates[0]?.id ?? null));
    setIsAssignModalOpen(true);
  };

  const handleAssignProgramSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const templateId = formData.get('template_id') as string;
    const memberId = formData.get('member_id') as string;
    const staffId = (formData.get('staff_id') as string) || undefined;

    if (!templateId || !memberId) {
      toast.error('Vui lòng chọn đầy đủ giáo án mẫu và học viên.');
      return;
    }

    startTransition(async () => {
      const res = await assignProgramToMember(templateId, memberId, staffId);
      if (res.success) {
        toast.success('Đã phân công giáo án cho học viên thành công.');
        setIsAssignModalOpen(false);
        setActiveTab('assigned');
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể phân công giáo án.');
      }
    });
  };

  const handleUpdateStatus = (programId: string, newStatus: 'active' | 'completed' | 'archived') => {
    startTransition(async () => {
      const res = await updateAssignedProgramStatus(programId, newStatus);
      if (res.success) {
        toast.success('Đã cập nhật trạng thái lộ trình tập luyện.');
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể cập nhật trạng thái.');
      }
    });
  };

  const handleDeleteAssigned = (programId: string, memberName: string) => {
    if (!window.confirm(`Hủy giáo án của học viên "${memberName}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteAssignedProgram(programId);
      if (res.success) {
        toast.success('Đã hủy giáo án của học viên.');
        if (viewingAssignedProgram?.id === programId) {
          setViewingAssignedProgram(null);
        }
        router.refresh();
      } else {
        toast.error(res.error || 'Không thể hủy giáo án.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 3-Tier Main Navigation Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-1.5 shadow-2xs">
          <Tabs.List className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <Tabs.Trigger
              value="catalog"
              className={cn(
                'flex items-center justify-center gap-2.5 h-11 px-4 rounded-lg text-sm font-semibold transition-all',
                activeTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Tầng 1: Thư viện bài tập chuẩn</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-mono',
                  activeTab === 'catalog'
                    ? 'bg-indigo-700/60 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {initialData.catalog.exercises.length}
              </span>
            </Tabs.Trigger>

            <Tabs.Trigger
              value="templates"
              className={cn(
                'flex items-center justify-center gap-2.5 h-11 px-4 rounded-lg text-sm font-semibold transition-all',
                activeTab === 'templates'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Layers className="w-4 h-4" />
              <span>Tầng 2: Khung giáo án mẫu</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-mono',
                  activeTab === 'templates'
                    ? 'bg-indigo-700/60 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {initialData.templates.length}
              </span>
            </Tabs.Trigger>

            <Tabs.Trigger
              value="assigned"
              className={cn(
                'flex items-center justify-center gap-2.5 h-11 px-4 rounded-lg text-sm font-semibold transition-all',
                activeTab === 'assigned'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Users className="w-4 h-4" />
              <span>Tầng 3: Giáo án đã giao học viên</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-mono',
                  activeTab === 'assigned'
                    ? 'bg-indigo-700/60 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {initialData.assignedPrograms.length}
              </span>
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        {/* =====================================================================
            TAB 1: THƯ VIỆN BÀI TẬP CHUẨN (TẦNG 1)
        ====================================================================== */}
        <Tabs.Content value="catalog" className="outline-none">
          <ExerciseCatalog initialData={initialData.catalog} />
        </Tabs.Content>

        {/* =====================================================================
            TAB 2: KHUNG GIÁO ÁN MẪU (TẦNG 2 - PROGRAM TEMPLATES BUILDER)
        ====================================================================== */}
        <Tabs.Content value="templates" className="outline-none space-y-6">
          {/* Nếu đang chọn 1 template để biên soạn ngày và bài tập */}
          {activeEditingTemplate ? (
            <div className="space-y-6">
              {/* Active Template Header Banner */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveEditingTemplateId(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Quay lại danh sách giáo án mẫu</span>
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="text-xs font-semibold text-indigo-600">
                      Trình biên soạn buổi tập
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      {activeEditingTemplate.title}
                    </h2>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
                        activeEditingTemplate.difficulty_level === 'beginner'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : activeEditingTemplate.difficulty_level === 'advanced'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      )}
                    >
                      {activeEditingTemplate.difficulty_level || 'intermediate'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Thời lượng: <strong>{activeEditingTemplate.duration_weeks || 4} tuần</strong>
                    </span>
                  </div>
                  {activeEditingTemplate.description && (
                    <p className="text-sm text-slate-500">{activeEditingTemplate.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddDayOpen(true)}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm buổi tập mới</span>
                  </button>

                  <button
                    onClick={() => handleOpenAssignModal(activeEditingTemplate.id)}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Giao giáo án này</span>
                  </button>
                </div>
              </div>

              {/* Danh sách các buổi tập trong template */}
              {activeEditingTemplate.days.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Chưa có buổi tập nào trong giáo án này
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                      Hãy thêm các buổi tập trong tuần (ví dụ: Ngày 1 - Đẩy ngực vai, Ngày 2 - Kéo lưng xô...) để bắt đầu xếp bài tập.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddDayOpen(true)}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm buổi tập đầu tiên</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeEditingTemplate.days.map((day) => (
                    <div
                      key={day.id}
                      className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
                    >
                      {/* Day Header */}
                      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                              Buổi {day.day_number}
                            </span>
                            <h3 className="text-base font-bold text-slate-900">{day.day_name}</h3>
                          </div>
                          {day.target_muscle_groups && day.target_muscle_groups.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {day.target_muscle_groups.map((mg, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-slate-600 border border-slate-200"
                                >
                                  {mg}
                                </span>
                              ))}
                            </div>
                          )}
                          {day.notes && (
                            <p className="text-xs text-slate-500 italic">Lưu ý: {day.notes}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setTargetDayForExercise(day);
                              setIsAddExerciseOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm bài tập</span>
                          </button>

                          <button
                            onClick={() => handleDeleteDay(day.id, day.day_name)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa buổi tập này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Exercises Table in Day */}
                      {day.exercises.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">
                          Chưa có bài tập nào trong buổi này. Nhấn <strong>"Thêm bài tập"</strong> để đưa bài từ thư viện vào.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-white text-xs font-semibold text-slate-500 border-b border-slate-100">
                              <tr>
                                <th className="py-3 px-6 w-12 text-center">#</th>
                                <th className="py-3 px-4">Bài tập kỹ thuật</th>
                                <th className="py-3 px-4">Nhóm cơ</th>
                                <th className="py-3 px-4">Dụng cụ</th>
                                <th className="py-3 px-4 text-center">Hiệp (Sets)</th>
                                <th className="py-3 px-4 text-center">Lần lặp (Reps)</th>
                                <th className="py-3 px-4 text-center">RPE</th>
                                <th className="py-3 px-4 text-center">Nghỉ (giây)</th>
                                <th className="py-3 px-4">Ghi chú của HLV</th>
                                <th className="py-3 px-6 w-14 text-center">Xóa</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-normal">
                              {day.exercises.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3.5 px-6 text-center text-xs font-mono font-medium text-slate-400">
                                    {idx + 1}
                                  </td>
                                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                                    {item.exercise?.name || 'Bài tập'}
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-600">
                                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                                      {item.exercise?.primary_muscle_group || 'Toàn thân'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-500 text-xs">
                                    {item.exercise?.equipment || 'Không'}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-600">
                                    {item.sets}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                                    {item.reps}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-mono text-xs">
                                    {item.rpe_target ? (
                                      <span className="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        RPE {item.rpe_target}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-mono text-slate-600 text-xs">
                                    {item.rest_seconds ? `${item.rest_seconds}s` : '—'}
                                  </td>
                                  <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                                    {item.coach_notes || '—'}
                                  </td>
                                  <td className="py-3.5 px-6 text-center">
                                    <button
                                      onClick={() =>
                                        handleRemoveExercise(item.id, item.exercise?.name || 'Bài tập')
                                      }
                                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                      title="Xóa bài tập khỏi buổi"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Danh sách các giáo án mẫu dạng Thẻ Grid */
            <div className="space-y-6">
              {/* Thống kê nhanh Tầng 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Tổng số giáo án mẫu</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">
                        {initialData.templates.length}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Khung giáo án chuẩn hóa cho PT</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Giáo án đã giao học viên</p>
                      <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                        {initialData.assignedPrograms.length}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Học viên đang áp dụng lộ trình</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Thư viện bài tập sẵn sàng</p>
                      <h3 className="text-2xl font-bold text-indigo-600 mt-1">
                        {initialData.catalog.exercises.length}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Bài tập chuẩn kỹ thuật</p>
                </div>
              </div>

              {/* Thanh công cụ tìm kiếm & nút tạo giáo án */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm giáo án mẫu..."
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>

                  <select
                    value={templateDifficultyFilter}
                    onChange={(e) => setTemplateDifficultyFilter(e.target.value)}
                    className="w-full sm:w-48 h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="all">Tất cả cấp độ</option>
                    <option value="beginner">Cơ bản (Beginner)</option>
                    <option value="intermediate">Trung cấp (Intermediate)</option>
                    <option value="advanced">Nâng cao (Advanced)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsCreateTemplateOpen(true)}
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo giáo án mẫu mới</span>
                  </button>
                </div>
              </div>

              {/* Grid danh sách các Template */}
              {filteredTemplates.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                  <p className="text-sm font-medium text-slate-600">
                    Không tìm thấy giáo án mẫu nào phù hợp.
                  </p>
                  <button
                    onClick={() => setIsCreateTemplateOpen(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo giáo án mẫu ngay</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((tpl) => {
                    const totalExercises = tpl.days.reduce(
                      (sum, d) => sum + (d.exercises ? d.exercises.length : 0),
                      0
                    );

                    return (
                      <div
                        key={tpl.id}
                        className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                      >
                        <div className="p-6 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span
                                className={cn(
                                  'inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2',
                                  tpl.difficulty_level === 'beginner'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : tpl.difficulty_level === 'advanced'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                )}
                              >
                                {tpl.difficulty_level || 'intermediate'}
                              </span>
                              <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                                {tpl.title}
                              </h3>
                            </div>
                            <button
                              onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              title="Xóa giáo án mẫu này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                            {tpl.description || 'Chưa có mô tả giáo án.'}
                          </p>

                          {/* Thông số kỹ thuật */}
                          <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-slate-50 rounded-lg text-center">
                            <div>
                              <p className="text-[10px] text-slate-400 font-medium">Thời lượng</p>
                              <p className="text-xs font-bold text-slate-800">
                                {tpl.duration_weeks || 4} tuần
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-medium">Số buổi/tuần</p>
                              <p className="text-xs font-bold text-indigo-600">
                                {tpl.days.length} buổi
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-medium">Tổng bài tập</p>
                              <p className="text-xs font-bold text-slate-800">
                                {totalExercises} bài
                              </p>
                            </div>
                          </div>

                          {/* Tóm tắt các buổi tập */}
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold text-slate-600">Lịch các buổi:</p>
                            {tpl.days.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">Chưa xếp buổi tập nào</p>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {tpl.days.map((d) => (
                                  <span
                                    key={d.id}
                                    className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium"
                                  >
                                    B{d.day_number}: {d.day_name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Thao tác chân thẻ */}
                        <div className="p-4 bg-slate-50/70 border-t border-slate-100 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setActiveEditingTemplateId(tpl.id)}
                            className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>Xếp bài tập</span>
                          </button>

                          <button
                            onClick={() => handleOpenAssignModal(tpl.id)}
                            className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Giao học viên</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Tabs.Content>

        {/* =====================================================================
            TAB 3: GIÁO ÁN ĐÃ GIAO HỌC VIÊN (TẦNG 3 - ASSIGNED & PERSONALIZATION)
        ====================================================================== */}
        <Tabs.Content value="assigned" className="outline-none space-y-6">
          {/* Thống kê nhanh Tầng 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
              <p className="text-xs font-semibold text-slate-500">Tổng giáo án đã giao</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {initialData.assignedPrograms.length}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Lộ trình cá nhân hóa</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
              <p className="text-xs font-semibold text-emerald-600">Đang áp dụng</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {initialData.assignedPrograms.filter((p) => p.status === 'active').length}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Hội viên đang tích cực tập</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
              <p className="text-xs font-semibold text-indigo-600">Đã hoàn thành</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">
                {initialData.assignedPrograms.filter((p) => p.status === 'completed').length}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Hoàn tất chu kỳ giáo án</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
              <p className="text-xs font-semibold text-slate-400">Đã lưu trữ</p>
              <h3 className="text-2xl font-bold text-slate-500 mt-1">
                {initialData.assignedPrograms.filter((p) => p.status === 'archived').length}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Hồ sơ lịch sử cũ</p>
            </div>
          </div>

          {/* Thanh công cụ tìm kiếm và nút giao giáo án */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm học viên, mã thẻ hoặc tên giáo án..."
                  value={assignedSearchQuery}
                  onChange={(e) => setAssignedSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>

              <select
                value={assignedStatusFilter}
                onChange={(e) => setAssignedStatusFilter(e.target.value)}
                className="w-full sm:w-48 h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang áp dụng (Active)</option>
                <option value="completed">Đã hoàn thành (Completed)</option>
                <option value="archived">Đã lưu trữ (Archived)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenAssignModal()}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Giao giáo án mới cho học viên</span>
              </button>
            </div>
          </div>

          {/* Bảng danh sách hội viên nhận giáo án */}
          {filteredAssignedPrograms.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <p className="text-sm font-medium text-slate-600">
                Không tìm thấy lộ trình giáo án nào phù hợp.
              </p>
              <button
                onClick={() => handleOpenAssignModal()}
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Giao giáo án cho học viên ngay</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200/80">
                    <tr>
                      <th className="py-3 px-6">Học viên tiếp nhận</th>
                      <th className="py-3 px-4">Giáo án áp dụng</th>
                      <th className="py-3 px-4">HLV phụ trách</th>
                      <th className="py-3 px-4 text-center">Quy mô lộ trình</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                      <th className="py-3 px-4">Ngày giao</th>
                      <th className="py-3 px-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredAssignedPrograms.map((prog) => {
                      const totalExercises = prog.days.reduce(
                        (sum, d) => sum + (d.exercises ? d.exercises.length : 0),
                        0
                      );

                      return (
                        <tr key={prog.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            {prog.member ? (
                              <div>
                                <Link
                                  href={`/dashboard/members/${prog.member.id}`}
                                  className="font-bold text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                                >
                                  <span>{prog.member.full_name}</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                </Link>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                  <span className="font-mono">{prog.member.member_code}</span>
                                  <span>•</span>
                                  <span>{prog.member.phone}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Không xác định</span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <p className="font-semibold text-slate-900">{prog.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Thời lượng: {prog.duration_weeks || 4} tuần
                            </p>
                          </td>

                          <td className="py-4 px-4">
                            {prog.staff ? (
                              <div>
                                <p className="font-medium text-slate-800">{prog.staff.full_name}</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">
                                  {prog.staff.role}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Chưa gán PT</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-bold text-slate-800">
                                {prog.days.length} buổi/tuần
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                ({totalExercises} bài tập)
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <select
                              value={prog.status}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  prog.id,
                                  e.target.value as 'active' | 'completed' | 'archived'
                                )
                              }
                              className={cn(
                                'h-8 px-2.5 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer',
                                prog.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : prog.status === 'completed'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              )}
                            >
                              <option value="active">Đang áp dụng</option>
                              <option value="completed">Đã hoàn thành</option>
                              <option value="archived">Lưu trữ</option>
                            </select>
                          </td>

                          <td className="py-4 px-4 text-xs text-slate-500">
                            {new Date(prog.created_at).toLocaleDateString('vi-VN')}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setViewingAssignedProgram(prog)}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                              >
                                <span>Xem lịch tập</span>
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteAssigned(
                                    prog.id,
                                    prog.member?.full_name || 'Học viên'
                                  )
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Hủy giáo án của học viên"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>

      {/* =======================================================================
          MODAL: TẠO GIÁO ÁN MẪU MỚI (TẦNG 2)
      ======================================================================= */}
      <Dialog.Root open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl z-50 animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-bold text-slate-900">
                    Tạo giáo án mẫu mới
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500">
                    Khung giáo án mẫu khoa học làm tiêu chuẩn phân công cho học viên
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateTemplateSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên giáo án mẫu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Ví dụ: Giáo án Tăng Cơ 4 Buổi (Upper - Lower Split)"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời lượng lộ trình (tuần)
                  </label>
                  <input
                    type="number"
                    name="duration_weeks"
                    min={1}
                    max={52}
                    defaultValue={8}
                    required
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cấp độ kỹ thuật
                  </label>
                  <select
                    name="difficulty_level"
                    defaultValue="intermediate"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="beginner">Cơ bản (Beginner)</option>
                    <option value="intermediate">Trung cấp (Intermediate)</option>
                    <option value="advanced">Nâng cao (Advanced)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả và mục tiêu giáo án
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Mô tả mục tiêu (Tăng cơ, giảm mỡ, sức mạnh), nguyên lý tập luyện và đối tượng phù hợp..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="h-10 px-4 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                </Dialog.Close>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isPending ? 'Đang tạo...' : 'Tạo giáo án'}</span>
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* =======================================================================
          MODAL: THÊM BUỔI TẬP VÀO GIÁO ÁN MẪU (TẦNG 2)
      ======================================================================= */}
      <Dialog.Root open={isAddDayOpen} onOpenChange={setIsAddDayOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl z-50 animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-bold text-slate-900">
                    Thêm buổi tập vào giáo án
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500">
                    Thiết lập buổi tập theo ngày trong tuần
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleAddDaySubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thứ tự buổi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="day_number"
                    min={1}
                    max={14}
                    defaultValue={(activeEditingTemplate?.days.length || 0) + 1}
                    required
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên buổi tập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="day_name"
                    required
                    placeholder="Ví dụ: Push Day (Ngực - Vai - Tay sau)"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhóm cơ mục tiêu (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  name="target_muscle_groups"
                  placeholder="Ví dụ: Chest, Shoulders, Triceps"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú buổi tập của HLV
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Lưu ý khởi động kỹ khớp vai, bổ sung nước giữa các hiệp nặng..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="h-10 px-4 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                </Dialog.Close>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isPending ? 'Đang thêm...' : 'Lưu buổi tập'}</span>
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* =======================================================================
          MODAL: THÊM BÀI TẬP VÀO BUỔI TẬP (TẦNG 2)
      ======================================================================= */}
      <Dialog.Root open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl z-50 animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-bold text-slate-900">
                    Thêm bài tập vào {targetDayForExercise?.day_name}
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500">
                    Chọn bài tập từ thư viện và cấu hình khối lượng tập luyện
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleAddExerciseSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn bài tập kỹ thuật <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm bài tập theo tên hoặc nhóm cơ..."
                      value={exerciseSearchInModal}
                      onChange={(e) => setExerciseSearchInModal(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50"
                    />
                  </div>

                  <select
                    name="exercise_id"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="">-- Chọn bài tập từ danh mục ({availableExercisesForModal.length} bài) --</option>
                    {availableExercisesForModal.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} — [{ex.primary_muscle_group}] ({ex.equipment || 'Bodyweight'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số hiệp (Sets) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="sets"
                    min={1}
                    max={20}
                    defaultValue={4}
                    required
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số lần (Reps) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="reps"
                    defaultValue="8-10"
                    required
                    placeholder="8-10 hoặc 45s"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    RPE mục tiêu
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={1}
                    max={10}
                    name="rpe_target"
                    defaultValue={8.0}
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nghỉ (giây)
                  </label>
                  <input
                    type="number"
                    name="rest_seconds"
                    min={15}
                    max={600}
                    step={15}
                    defaultValue={90}
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lưu ý kỹ thuật và điều chỉnh form tạ của PT
                </label>
                <textarea
                  name="coach_notes"
                  rows={2}
                  placeholder="Ví dụ: Hạ tạ có kiểm soát 2 giây, đẩy bùng nổ 1 giây, siết cơ đỉnh động tác..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="h-10 px-4 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                </Dialog.Close>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isPending ? 'Đang thêm...' : 'Lưu bài tập'}</span>
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* =======================================================================
          MODAL: GIAO GIÁO ÁN CHO HỘI VIÊN (TẦNG 3)
      ======================================================================= */}
      <Dialog.Root open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl z-50 animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-bold text-slate-900">
                    Giao giáo án cho học viên
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500">
                    Tự động nhân bản toàn bộ buổi tập và bài tập sang hồ sơ học viên
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleAssignProgramSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn giáo án mẫu <span className="text-rose-500">*</span>
                </label>
                <select
                  name="template_id"
                  defaultValue={preSelectedTemplateId || ''}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="">-- Chọn giáo án mẫu --</option>
                  {initialData.templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title} ({tpl.days.length} buổi/tuần, {tpl.duration_weeks} tuần)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn hội viên tiếp nhận <span className="text-rose-500">*</span>
                </label>
                <select
                  name="member_id"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="">-- Chọn hội viên ({initialData.members.length} hội viên) --</option>
                  {initialData.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} — {m.member_code} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Huấn luyện viên phụ trách (PT)
                </label>
                <select
                  name="staff_id"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="">-- Tự động theo người phân công hoặc chọn PT --</option>
                  {initialData.staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-xs text-amber-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cơ chế nhân bản độc lập (3-Tier Deep Clone)</span>
                </p>
                <p>
                  Giáo án sẽ được sao chép nguyên vẹn thành một bản sao riêng cho học viên. HLV có thể tùy ý tinh chỉnh số hiệp, số lần và mức tạ mà không ảnh hưởng đến giáo án mẫu gốc.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="h-10 px-4 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                </Dialog.Close>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isPending ? 'Đang phân công...' : 'Xác nhận giao giáo án'}</span>
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* =======================================================================
          MODAL: XEM CHI TIẾT LỘ TRÌNH HỌC VIÊN (TẦNG 3)
      ======================================================================= */}
      {viewingAssignedProgram && (
        <Dialog.Root
          open={!!viewingAssignedProgram}
          onOpenChange={(open) => !open && setViewingAssignedProgram(null)}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-in fade-in" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-xl z-50 animate-in zoom-in-95 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <Dialog.Title className="text-base font-bold text-slate-900">
                      Chi tiết lộ trình: {viewingAssignedProgram.title}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-slate-500">
                      Học viên: <strong>{viewingAssignedProgram.member?.full_name}</strong> (Mã thẻ: {viewingAssignedProgram.member?.member_code})
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close asChild>
                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Thông tin nhanh */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl text-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Thời lượng</p>
                  <p className="text-xs font-bold text-slate-800">
                    {viewingAssignedProgram.duration_weeks || 4} tuần
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Số buổi tập</p>
                  <p className="text-xs font-bold text-indigo-600">
                    {viewingAssignedProgram.days.length} buổi/tuần
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">HLV phụ trách</p>
                  <p className="text-xs font-bold text-slate-800">
                    {viewingAssignedProgram.staff?.full_name || 'Tự do'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Trạng thái</p>
                  <p className="text-xs font-bold uppercase text-emerald-600">
                    {viewingAssignedProgram.status}
                  </p>
                </div>
              </div>

              {/* Chi tiết từng buổi và bài tập */}
              <div className="space-y-4">
                {viewingAssignedProgram.days.map((day) => (
                  <div
                    key={day.id}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Buổi {day.day_number}: {day.day_name}
                      </span>
                      {day.target_muscle_groups && day.target_muscle_groups.length > 0 && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {day.target_muscle_groups.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      {day.exercises.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Không có bài tập</p>
                      ) : (
                        <div className="space-y-2">
                          {day.exercises.map((item, i) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/50 hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-400 w-4">{i + 1}.</span>
                                <span className="font-semibold text-slate-900">
                                  {item.exercise?.name || 'Bài tập'}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200/70 text-slate-600">
                                  {item.exercise?.primary_muscle_group}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 font-mono">
                                <span className="font-bold text-indigo-600">
                                  {item.sets} hiệp × {item.reps}
                                </span>
                                {item.rpe_target && (
                                  <span className="text-amber-700">RPE {item.rpe_target}</span>
                                )}
                                {item.rest_seconds && (
                                  <span className="text-slate-500">Nghỉ {item.rest_seconds}s</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {viewingAssignedProgram.member && (
                  <Link
                    href={`/dashboard/members/${viewingAssignedProgram.member.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>Mở hồ sơ 360° của học viên</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}

                <Dialog.Close asChild>
                  <button className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                    Đóng
                  </button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}

