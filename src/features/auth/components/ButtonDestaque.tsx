import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { ArrowRight } from 'lucide-react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function ButtonDestaque({ children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`login-button-destaque ${className}`.trim()} {...props}>
      {children}
      <ArrowRight aria-hidden="true" size={14} strokeWidth={2} />
    </button>
  );
}
