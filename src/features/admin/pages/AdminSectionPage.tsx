type AdminSectionPageProps = {
  title: string;
};

/** Conteudo temporario das secoes ate que cada funcionalidade ganhe sua propria tela. */
export function AdminSectionPage({ title }: AdminSectionPageProps) {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-navy">{title}</h1>
      <p className="mt-3 text-sm text-slate-600">Conteúdo desta seção em desenvolvimento.</p>
    </section>
  );
}
