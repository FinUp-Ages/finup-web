import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`login-button ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export default Button;
