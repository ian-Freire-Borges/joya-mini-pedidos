import type { ReactNode } from 'react';

interface AlertaProps {
  children: ReactNode;
  tipo?: 'error' | 'success';
  onFechar?: () => void;
}

export function Alerta({ children, tipo = 'error', onFechar }: AlertaProps) {
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`alert ${tipo}`}>
      {children}
      {onFechar && (
        <button className="text-button" aria-label="Fechar confirmação" onClick={onFechar}>
          Fechar
        </button>
      )}
    </div>
  );
}
