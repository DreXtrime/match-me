import React from 'react';

export type BtnVariant = 'accept' | 'reject' | 'primary' | 'ghost' | 'cta' | 'chat';

const variants: Record<BtnVariant, string> = {
  accept: 'bg-transparent text-green border-1 border-border-dim hover:bg-yellow-hot',
  reject: 'bg-transparent text-red  border-1 border-red hover:bg-yellow-hot',
  primary: 'bg-transparent text-text border-1 border-border-dim hover:bg-yellow-hot',
  ghost: 'bg-transparent text-text border-1 border-border-dim hover:bg-yellow-hot',
  cta: 'bg-transparent text-text border-1 border-border-dim hover:bg-yellow-hot px-8',
  chat: 'px-5 py-2.5 bg-yellow text-bg font-bold text-sm border-2 border-yellow hover:opacity-90 transition-opacity shrink-0',
};

export const Btn: React.FC<{
  variant: BtnVariant;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ variant, onClick, children }) => (
  <button onClick={onClick} className={`px-4 py-2 text-sm font-bold tracking-wide transition-colors ${variants[variant]}`}>
    {children}
  </button>
);
