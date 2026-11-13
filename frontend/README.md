# Frontend — Mini Gestão de Pedidos

React/TypeScript/Vite. Organização inspirada na separação já existente no Party Time de Ian, com componentes de apresentação, página, hooks e cliente HTTP separados.

| Diretório | Responsabilidade |
|---|---|
| src/App.tsx | Composição do layout; sem fetch ou regra de formulário |
| src/pages | Coordenação da página, filtros aplicados e atualização após criação |
| src/components/layout | Cabeçalho e rodapé |
| src/components/common | Alertas e paginação |
| src/components/pedidos | Tabela, filtros, ranking, formulário e item do formulário |
| src/hooks | Ciclo de consulta/cancelamento e estado de envio do formulário |
| src/services | Transporte HTTP e operações com a API |
| src/types | Contratos TypeScript |
| src/utils | Filtros UTC, formatação e transformação do formulário |
| src/styles | CSS legível, sem minificação manual |
| tests | Regressão dos contratos de serviços e funções extraídas |

Dependências: componentes não fazem fetch; hooks chamam serviços; serviços e utilitários não dependem de React. A API continua responsável pelo preço, pelo estoque e pela transação.

## Verificação

Na raiz do frontend, com Node 24:

```powershell
npm test
npm run build
```

`npm test` usa o runner nativo do Node, sem novas dependências. As requisições de teste são simuladas; isso não substitui teste de integração com SQL Server. Build verifica tipos e gera os arquivos para implantação. Inspeção de UI deve conferir listagem, filtro, paginação, detalhes, vários itens, erro do servidor e envio único, sem alterar dados reais.

Esta etapa organiza o código e preserva o layout. Banco externo, rewrite da Vercel, redesign e backend são trabalhos separados.
