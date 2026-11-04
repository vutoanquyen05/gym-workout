import type { Metadata } from 'next';
import React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'GymOS — Hệ thống quản trị phòng tập',
  description:
    'Hệ thống quản trị phòng gym đa chi nhánh, CRM 360°, trạm giáo án huấn luyện và kiểm soát điểm danh',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
