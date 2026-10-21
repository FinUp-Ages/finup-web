import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type SecondaryButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

/** Par do Button primario (mesma altura e formato), com contorno no lugar do fundo navy. */
export function SecondaryButton({ children, className = '', ...props }: SecondaryButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex h-[55px] w-full cursor-pointer items-center justify-center rounded-full border border-navy bg-white px-10 text-base leading-[21px] text-navy hover:bg-surface-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-70 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
