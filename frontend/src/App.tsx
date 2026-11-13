import { Cabecalho } from './components/layout/Cabecalho';
import { Rodape } from './components/layout/Rodape';
import { PedidosPage } from './pages/PedidosPage';

export default function App() {
  return (
    <>
      <Cabecalho />
      <main>
        <PedidosPage />
        <Rodape />
      </main>
    </>
  );
}
