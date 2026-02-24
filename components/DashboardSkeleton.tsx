import React from 'react';

const Block: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl bg-slate-200/70 ${className}`} />
);

const Card: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`rounded-2xl bg-white shadow-sm border border-slate-200/70 ${className}`}>
    <div className="p-5">{children}</div>
  </div>
);

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <Block className="h-6 w-44 mb-2" />
          <Block className="h-4 w-72" />
        </div>
        <Block className="h-10 w-52 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between">
              <div>
                <Block className="h-4 w-28 mb-3" />
                <Block className="h-8 w-24" />
              </div>
              <Block className="h-10 w-10 rounded-xl" />
            </div>
            <div className="mt-4">
              <Block className="h-3 w-40 mb-2" />
              <Block className="h-3 w-28" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <Block className="h-4 w-40 mb-4" />
          <Block className="h-64 w-full" />
        </Card>
        <Card>
          <Block className="h-4 w-36 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <Block className="h-4 w-40" />
                <Block className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
