import React from 'react';
import { notFound } from 'next/navigation';
import { getMember360Profile } from '../actions';
import { Member360View } from './member-360-view';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getMember360Profile(id);

  if (error || !data) {
    notFound();
  }

  return <Member360View initialData={data} />;
}

