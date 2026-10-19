import { forwardRef, type InputHTMLAttributes } from 'react';

/**
 * Campo de texto do design (componente "inputs" do Figma): 50px de altura, fundo cinza e
 * cantos de 6px. `aria-invalid` destaca a borda em vermelho.
 */
export const Input = forwardRef<HTMLInputElement, Readonly<InputHTMLAttributes<HTMLInputElement>>>(
  function Input({ className = '', ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`h-[50px] w-full rounded-md border-0 bg-login-field px-5 text-sm leading-[18px] text-black outline-none placeholder:text-black placeholder:opacity-100 focus-visible:ring-2 focus-visible:ring-navy aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-login-error aria-[invalid=true]:focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
        {...props}
      />
    );
  },
);
