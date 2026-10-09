import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`h-[45px] w-full cursor-pointer rounded-full border-0 bg-navy text-xs text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-[3px] ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
