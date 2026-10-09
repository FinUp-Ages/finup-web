import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { ArrowRight } from 'lucide-react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function ButtonDestaque({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`z-[2] inline-flex h-8 w-[162px] items-center justify-center gap-1.5 rounded-[5px] border-0 bg-white/10 px-3 mt-4 font-destaque text-sm font-normal text-white cursor-pointer hover:bg-white/[0.18] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[3px] ${className}`.trim()}
      {...props}
    >
      {children}
      <ArrowRight aria-hidden="true" size={14} strokeWidth={2} />
    </button>
  );
}
