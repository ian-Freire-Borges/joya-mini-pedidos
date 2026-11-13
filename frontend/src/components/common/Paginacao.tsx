interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  carregando: boolean;
  temErro: boolean;
  onMudar: (pagina: number) => void;
}

export function Paginacao({ pagina, totalPaginas, carregando, temErro, onMudar }: PaginacaoProps) {
  return (
    <nav className="pagination" aria-label="Paginação de pedidos">
      <span>Página {pagina} de {Math.max(1, totalPaginas)}</span>
      <div>
        <button
          className="secondary"
          disabled={carregando || pagina <= 1}
          onClick={() => onMudar(pagina - 1)}
        >
          Anterior
        </button>
        <button
          className="secondary"
          disabled={carregando || temErro || pagina >= totalPaginas}
          onClick={() => onMudar(pagina + 1)}
        >
          Próxima
        </button>
      </div>
    </nav>
  );
}
