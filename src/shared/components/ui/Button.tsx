import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

/** Botao primario do design (componente "primary" do Figma): 55px de altura, em pilula. */
export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-[55px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-navy px-10 text-base leading-[21px] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-70 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
