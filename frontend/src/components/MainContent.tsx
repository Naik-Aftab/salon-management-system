import type { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export default function MainContent({ children, className = '' }: MainContentProps) {
  return (
    <main
      className={`flex-1 overflow-auto bg-slate-50 p-6 [&_article]:shadow-[0_6px_14px_rgba(15,23,42,0.07)] [&_article]:transition-shadow [&_article:hover]:shadow-[0_8px_18px_rgba(15,23,42,0.1)] ${className}`}
    >
      {children}
    </main>
  );
}
