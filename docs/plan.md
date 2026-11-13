# Plano real elaborado com Codex

## Atualização do checkpoint inicial

Ian autorizou primeiro push privado à main. Identidade Git confirmada. Banco inicializado e API compilada/iniciada pelo usuário. Frontend falhou no build; correção e088bb9 aguarda rebuild. Testes/CI/MCP/Claude pendentes. A partir deste envio: uma etapa, teste, documentação, commit e push confirmado antes da próxima; parar em erro. Afirmações anteriores sobre instalações e autorização são históricas. Ver docs/checkpoint-inicial.md.

1. Inspecionar ambiente e escrever spec antes do código — realizado.
2. Preparar estrutura, instruções e configurações AI verificadas na documentação oficial.
3. Escrever schema SQL como fonte de verdade, seed idempotente e Compose.
4. Implementar API simples com EF nas leituras e SQL parametrizado no caminho transacional.
5. Testar regras puras com xUnit e HTTP/concorrência com SQL Server real.
6. Implementar UI React TypeScript, testes E2E e CI.
7. Executar quando dependências disponíveis; registrar resultados, produzir guia e auditar.

## Alternativas e escolhas
.NET 10 LTS: .NET 8/9 encerraram suporte em 10/11/2026 conforme política Microsoft consultada em 13/11. SQL Server 2022 Developer mantém compatibilidade amplamente documentada. Schema SQL autoritativo; EF sem migrations/EnsureCreated para impedir criação divergente. Uma API, um serviço de pedidos, um DbContext; sem repositório genérico.

## Riscos observados
Não há dotnet/docker/gh no PATH; caminhos usuais de instalação de .NET/Docker ausentes; WSL não instalado. DNS de api.nuget.org e registry.npmjs.org falhou. CIM de virtualização recusado. Identidade git global sem nome/e-mail. Não há commits até identidade confirmada. Portas 1433/8080/5173 não apareceram na consulta, que por si só não comprova capacidade de bind. Docker/SQL/testes não validados.

## Histórico verdadeiro
A sequência solicitada será adaptada aos bloqueios: arquivos podem ser preparados sem SDK; não serão produzidos commits retrospectivos para simular etapas. Não há autorização de publicação. Nenhum uso de Claude ocorreu.

## Revisão em Claude plan mode
Pendente. Inserir aqui somente observações de uma sessão real futura.
