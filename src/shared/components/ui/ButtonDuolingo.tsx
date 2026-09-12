import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { ArrowRight } from 'lucide-react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

function ButtonDuolingo({ children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`login-button-duolingo ${className}`.trim()} {...props}>
      {children}
      <ArrowRight aria-hidden="true" size={14} strokeWidth={2} />
    </button>
  );
}

export default ButtonDuolingo;
