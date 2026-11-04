'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ScanLine,
  Users,
  CreditCard,
  Dumbbell,
  Building2,
  ShieldCheck,
  Settings,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export function SidebarNav() {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      groupName: 'VẬN HÀNH VÀ TIẾP TÂN',
      items: [
        {
          name: 'Tổng quan',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          name: 'Quầy điểm danh',
          href: '/dashboard/check-in',
          badge: 'Check-in',
          badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: ScanLine,
        },
        {
          name: 'Quản lý hội viên',
          href: '/dashboard/members',
          icon: Users,
        },
      ],
    },
    {
      groupName: 'DỊCH VỤ VÀ HUẤN LUYỆN',
      items: [
        {
          name: 'Gói tập và bảng giá',
          href: '/dashboard/plans',
          icon: CreditCard,
        },
        {
          name: 'Giáo án tập luyện',
          href: '/dashboard/workouts',
          badge: '3 tầng',
          badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          icon: Dumbbell,
        },
      ],
    },
    {
      groupName: 'QUẢN TRỊ HỆ THỐNG',
      items: [
        {
          name: 'Chi nhánh cơ sở',
          href: '/dashboard/branches',
          icon: Building2,
        },
        {
          name: 'Nhân sự và huấn luyện viên',
          href: '/dashboard/staff',
          icon: ShieldCheck,
        },
        {
          name: 'Cài đặt hệ thống',
          href: '/dashboard/settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
      {navGroups.map((group) => (
        <div key={group.groupName} className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            {group.groupName}
          </p>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 font-semibold ring-1 ring-inset ring-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`ml-2 px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
