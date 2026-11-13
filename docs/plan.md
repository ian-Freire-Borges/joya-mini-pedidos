# Plano de implementação — Codex

Este plano foi elaborado com Codex. Nenhuma sessão Claude plan mode ocorreu. O enunciado declara Codex obrigatório, mas pede Claude em outras partes; a divergência ainda precisa esclarecimento.

## Sequência e estado

1. Especificação de regras, modelo, endpoints e aceite: docs/spec.md existente.
2. Schema/seed e Docker Compose: implementados; serviços executados por etapas. Validar inicialização completa com um comando em ambiente isolado.
3. API e regras: implementadas. Unitários anteriores executados em Docker. Adicionados casos de cliente inexistente, estoque insuficiente, produto inexistente e preço decimal; decisões extraídas de PedidosService para RegrasPedido e reutilizadas na produção. Ian confirmou execução dos unitários com sucesso, sem contagem informada; integração repetida com 21 testes aprovados, 0 falhas e 0 ignorados em aproximadamente 5,2 s. Validação registrada antes do commit.
4. Frontend: implementado e separado em componentes, hooks, serviços e utilitários; build/testes aprovados e leituras conferidas no navegador.
5. Integração automatizada com SQL Server real: suíte implementada em tests/IntegrationTests, com Compose isolado, incluindo criação, rollback e concorrência. Executada por Ian no PowerShell em 13/11/2026: build concluído, 21 testes aprovados, 0 falhas e 0 ignorados (aproximadamente 5,1 s). Etapa pronta para commit e push, com resultados registrados no README.
6. Debug da query fornecida: scripts corrigido e comparativo executados por Ian no SQL de testes. Verificações de resultados aprovadas; 100 mil pedidos, planos reais e três rodadas IO/TIME analisados. README registra números e limites: intervalo melhora estimativa e tempo observado, mas não reduz leituras nem gera seek nesse cenário. Nenhum índice adicional imposto sem evidência.
7. AI First: rules, hook, skill e MCP pendentes de implementação/uso real e alinhamento sobre Claude.
8. Entrega: README consolidado, deploy online funcional para leituras; vídeo e e-mail pendentes. CI e Playwright são diferenciais.

## Ajustes efetivamente realizados

- Ian pediu organização semelhante ao código do Party Time; refatorado o frontend antes de avançar na arquitetura do backend, preservando o visual.
- Teste manual encontrou erro de tradução EF no ranking; corrigida apenas essa consulta para desbloquear a validação, com regressão ToQueryString.
- Ian rejeitou desabilitar validação do certificado na hospedagem; diagnóstico identificou o SAN e a conexão foi corrigida mantendo validação ativa.
- Ian pediu documentação proporcional ao enunciado; registros redundantes consolidados no README e histórico mantido no Git.

## Decisões

SQL scripts são autoritativos, sem migrations paralelas. Leituras usam EF; baixa usa SQL parametrizado e transação. Preços vêm do servidor; produtos são processados em ordem crescente; dinheiro decimal e datas UTC. Esses caminhos precisam de validação de integração, não apenas revisão estática.

Uma etapa por vez: implementar, testar, documentar o necessário, commit e push confirmado. Não reescrever histórico, simular ferramentas ou registrar testes não executados.
