import React from 'react';
import Link from 'next/link';
import { getMembershipPlans, getBranchOptions } from '../actions';
import { CreateMemberForm } from './create-form';

export const dynamic = 'force-dynamic';

export default async function CreateMemberPage() {
  const { data: plans, error: planError } = await getMembershipPlans();
  const { data: branches } = await getBranchOptions();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>←</span>
          <span>Quay lại danh sách hội viên</span>
        </Link>
      </div>

      <CreateMemberForm
        plans={plans}
        branches={branches}
        initialError={planError}
      />
    </div>
  );
}
