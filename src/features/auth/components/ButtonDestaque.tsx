import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { ArrowRight } from 'lucide-react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function ButtonDestaque({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-[46px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] border-0 bg-white/10 p-2.5 text-xl font-medium leading-[26px] tracking-[0.02em] text-white hover:bg-white/[0.18] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[3px] ${className}`.trim()}
      {...props}
    >
      {children}
      <ArrowRight aria-hidden="true" size={20} strokeWidth={2} />
    </button>
  );
}
