import { useState } from 'react';
import { GraficoCrescimentoUsuario, type OpcaoPeriodo } from './GraficoCrescimentoUsuario';
import { useUserGrowth } from '../hooks/useUserGrowth';

const opcoesPeriodo: OpcaoPeriodo[] = [
  { meses: 3, rotulo: 'Últimos 3 meses' },
  { meses: 6, rotulo: 'Últimos 6 meses' },
  { meses: 12, rotulo: 'Últimos 12 meses' },
];

export function WidgetCrescimentoUsuario() {
  const [periodo, setPeriodo] = useState(6);
  const { dados, isLoading, errorMessage, reload } = useUserGrowth(periodo);
  return (
    <GraficoCrescimentoUsuario
      dados={dados}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onTentarNovamente={reload}
      periodo={periodo}
      opcoesPeriodo={opcoesPeriodo}
      onPeriodoChange={setPeriodo}
    />
  );
}
