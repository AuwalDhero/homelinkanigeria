import React from 'react';
import { Status } from '../../index';

const Badge = ({ status }: { status: Status }) => {
  const colors: Record<Status, string> = {
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-100',
    SUSPENDED: 'bg-slate-100 text-slate-700 border-slate-200'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[status]}`}>{status}</span>;
};

export default Badge;
