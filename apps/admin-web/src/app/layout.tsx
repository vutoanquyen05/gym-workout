import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Gym Tracker - Admin Web Portal',
  description: 'Nền tảng quản lý phòng tập đa chi nhánh',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

