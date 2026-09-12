/**
 * Tela de exemplo da feature "example".
 *
 * Consome o hook de dados da propria feature e renderiza os tres estados
 * possiveis (carregando, erro, sucesso). Nao importa api/ nem axios diretamente.
 */
import { ExampleList } from '../components/ExampleList';
import { useExample } from '../hooks/useExample';

export function ExamplePage() {
  const { items, isLoading, errorMessage, reload } = useExample();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (errorMessage) {
    return (
      <div role="alert">
        <p>{errorMessage}</p>
        <button type="button" onClick={reload}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return <ExampleList items={items} />;
}
