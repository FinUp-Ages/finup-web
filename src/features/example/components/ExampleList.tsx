/**
 * Componente interno da feature "example".
 * Recebe props e nao busca dado. Se outra feature precisar dele, promova para shared/components/.
 */
import type { ExampleItem } from '../types';

interface ExampleListProps {
  items: ExampleItem[];
}

export function ExampleList({ items }: ExampleListProps) {
  // TODO: implementar em tarefa futura — layout real com componentes de shared/components/ui.
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
