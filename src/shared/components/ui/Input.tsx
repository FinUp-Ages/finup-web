import type { InputHTMLAttributes } from 'react';

function Input(props: Readonly<InputHTMLAttributes<HTMLInputElement>>) {
  const { className = '', ...inputProps } = props;

  return <input className={`login-input ${className}`.trim()} {...inputProps} />;
}

export default Input;
