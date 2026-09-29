import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`mt-[14px] h-[45px] w-full cursor-pointer rounded-[10000px] border-0 !bg-navy text-xs text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-[3px] ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
