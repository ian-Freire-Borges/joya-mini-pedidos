export function Cabecalho() {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Joya início">
        <span className="brand-icon">j.</span>
        <span>joya<span className="brand-sub">mini gestão</span></span>
      </a>
      <span className="workspace">
        Gestão de pedidos <span className="dot" /> Ambiente local
      </span>
    </header>
  );
}
