import { Loader2 } from 'lucide-react';

/** Tela inteira em espera, ex.: enquanto a sessao salva e conferida apos um reload. */
export function FullPageLoader({ label = 'Carregando…' }: Readonly<{ label?: string }>) {
  return (
    <div role="status" className="flex min-h-screen items-center justify-center bg-white text-navy">
      <Loader2 aria-hidden="true" size={32} className="animate-spin" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
