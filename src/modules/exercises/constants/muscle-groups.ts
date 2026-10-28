import type { CreateExerciseInput } from '@/shared/storage/types';

export const MUSCLE_GROUPS = [
  'Tất cả',
  'Ngực',
  'Lưng',
  'Chân',
  'Vai',
  'Tay',
  'Bụng',
  'Toàn thân',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT_OPTIONS = [
  'Tất cả',
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Khác',
] as const;

export type EquipmentOption = (typeof EQUIPMENT_OPTIONS)[number];

export const INITIAL_SEED_EXERCISES: readonly CreateExerciseInput[] = [
  {
    name: 'Barbell Bench Press',
    primaryMuscleGroup: 'Ngực',
    equipment: 'Barbell',
    difficulty: 'Trung bình',
    instructions: 'Nằm trên ghế phẳng, hạ tạ có kiểm soát xuống giữa ngực và đẩy dứt khoát lên.',
  },
  {
    name: 'Incline Dumbbell Press',
    primaryMuscleGroup: 'Ngực',
    equipment: 'Dumbbell',
    difficulty: 'Trung bình',
    instructions: 'Ghế dốc 30-45 độ, siết ngực trên khi đẩy tạ lên đỉnh chuyển động.',
  },
  {
    name: 'Barbell Back Squat',
    primaryMuscleGroup: 'Chân',
    equipment: 'Barbell',
    difficulty: 'Nâng cao',
    instructions: 'Đặt tạ trên cầu vai, hạ mông về sau song song mặt sàn rồi đạp gót đứng dậy.',
  },
  {
    name: 'Romanian Deadlift',
    primaryMuscleGroup: 'Chân',
    equipment: 'Barbell',
    difficulty: 'Trung bình',
    instructions: 'Giữ lưng thẳng, đẩy hông về sau kéo căng cơ đùi sau và gân kheo.',
  },
  {
    name: 'Conventional Deadlift',
    primaryMuscleGroup: 'Lưng',
    equipment: 'Barbell',
    difficulty: 'Nâng cao',
    instructions: 'Tư thế đứng thẳng người, nâng tạ khỏi sàn sử dụng lực toàn thân kết hợp đùi và lưng.',
  },
  {
    name: 'Pull-up',
    primaryMuscleGroup: 'Lưng',
    equipment: 'Bodyweight',
    difficulty: 'Trung bình',
    instructions: 'Treo người trên xà, kéo ngực lên sát thanh xà bằng lực cơ xô và cơ lưng rộng.',
  },
  {
    name: 'Overhead Press (OHP)',
    primaryMuscleGroup: 'Vai',
    equipment: 'Barbell',
    difficulty: 'Trung bình',
    instructions: 'Đứng vững, siết cơ core và đẩy thanh đòn qua đầu khóa khớp an toàn.',
  },
  {
    name: 'Dumbbell Lateral Raise',
    primaryMuscleGroup: 'Vai',
    equipment: 'Dumbbell',
    difficulty: 'Cơ bản',
    instructions: 'Nâng tạ sang hai bên đến khi cánh tay song song mặt sàn để kích hoạt cơ vai giữa.',
  },
  {
    name: 'Barbell Bicep Curl',
    primaryMuscleGroup: 'Tay',
    equipment: 'Barbell',
    difficulty: 'Cơ bản',
    instructions: 'Giữ cùi chỏ cố định sát thân, cuộn tạ lên siết chặt cơ bắp tay trước.',
  },
  {
    name: 'Tricep Rope Pushdown',
    primaryMuscleGroup: 'Tay',
    equipment: 'Cable',
    difficulty: 'Cơ bản',
    instructions: 'Kéo dây cáp xuống và mở rộng hai đầu dây ở đáy chuyển động để siết cơ tay sau.',
  },
  {
    name: 'Plank',
    primaryMuscleGroup: 'Bụng',
    equipment: 'Bodyweight',
    difficulty: 'Cơ bản',
    instructions: 'Giữ thân người thẳng tắp trên khuỷu tay và mũi chân, siết chặt cơ bụng.',
  },
];
