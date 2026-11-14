# Plano de implementação — agente de IA

Este plano foi elaborado com um agente de IA. A revisão em plan mode exigida no enunciado ainda precisa de evidência de execução; Ian definiu que o trabalho é realizado por agente de IA, preservando os nomes de arquivos pedidos no enunciado.

## Sequência e estado

1. Especificação de regras, modelo, endpoints e aceite: docs/spec.md existente.
2. Schema/seed e Docker Compose: validados com um comando no projeto separado joya-validacao, rede e volume novos, porta 8081. SQL Healthy, init Exited, API/UI Started; navegador confirmou seed, ranking e health ok. Sem apagar volume da aplicação; cache de imagens/dependências pôde ser reutilizado.
3. API e regras: implementadas. Unitários anteriores executados em Docker. Adicionados casos de cliente inexistente, estoque insuficiente, produto inexistente e preço decimal; decisões extraídas de PedidosService para RegrasPedido e reutilizadas na produção. Ian confirmou execução dos unitários com sucesso, sem contagem informada; integração repetida com 21 testes aprovados, 0 falhas e 0 ignorados em aproximadamente 5,2 s. Validação registrada antes do commit.
4. Frontend: implementado e separado em componentes, hooks, serviços e utilitários; build/testes aprovados e leituras conferidas no navegador.
5. Integração automatizada com SQL Server real: suíte implementada em tests/IntegrationTests, com Compose isolado, incluindo criação, rollback e concorrência. Executada por Ian no PowerShell em 13/11/2026: build concluído, 21 testes aprovados, 0 falhas e 0 ignorados (aproximadamente 5,1 s). Etapa pronta para commit e push, com resultados registrados no README.
6. Debug da query fornecida: scripts corrigido e comparativo executados por Ian no SQL de testes. Verificações de resultados aprovadas; 100 mil pedidos, planos reais e três rodadas IO/TIME analisados. README registra números e limites: intervalo melhora estimativa e tempo observado, mas não reduz leituras nem gera seek nesse cenário. Nenhum índice adicional imposto sem evidência.
7. AI First: skill customizada criar-endpoint criada e validada; rules CLAUDE.md e hook PostToolUse implementados. Eventos manuais do hook aprovaram seis testes frontend e 21 unitários e recusaram caminho externo. MCP validado no SQL de testes por cliente diagnóstico: initialize, tools/list, describe_entities e read_records, SQL MCP Server 2.1.5, protocolo 2025-03-26, apenas leitura. A skill foi aplicada na etapa A da refatoração; falta acionamento automático no cliente. O MCP foi efetivamente utilizado pelo agente de IA via cliente Node; não há etapa adicional condicionada a outro agente. Limites e falha inicial do testhost registrados no README.
8. Entrega: README consolidado, deploy online funcional para leituras; vídeo e e-mail pendentes. CI e Playwright são diferenciais.

## Ajustes efetivamente realizados

- Criada a skill customizada `.claude/skills/criar-endpoint/SKILL.md` por prioridade de Ian. O manual reúne as verificações específicas de preço, estoque transacional, contratos e testes. `AGENTS.md` direciona sua leitura. A criação não comprova uso automático pelo cliente; os resultados posteriores de rules, hook e MCP estão registrados na sequência e no README.

- Retomada local em 14/11/2026: histórico recuperado no commit 0615929; 21 unitários .NET, seis testes frontend e build frontend aprovados pelo agente. Ian executou a integração Docker/SQL Server real: 21 aprovados, zero falhas e zero ignorados. Baseline confirmado antes da refatoração. A configuração AI First não estava publicada nesse checkout e foi implementada nas etapas seguintes.
- Skill oficial aspnet-core instalada no Codex e aplicada à revisão da arquitetura existente. Manter Minimal APIs, DI scoped, ProblemDetails e SQL transacional; separar responsabilidades sem introduzir novas camadas/bibliotecas. A skill customizada foi criada e aplicada nas etapas seguintes.

- Ian pediu organização semelhante ao código do Party Time; refatorado o frontend antes de avançar na arquitetura do backend, preservando o visual.
- Teste manual encontrou erro de tradução EF no ranking; corrigida apenas essa consulta para desbloquear a validação, com regressão ToQueryString.
- Ian rejeitou desabilitar validação do certificado na hospedagem; diagnóstico identificou o SAN e a conexão foi corrigida mantendo validação ativa.
- Ian pediu documentação proporcional ao enunciado; registros redundantes consolidados no README e histórico mantido no Git.

## Decisões

SQL scripts são autoritativos, sem migrations paralelas. Leituras usam EF; baixa usa SQL parametrizado e transação. Preços vêm do servidor; produtos são processados em ordem crescente; dinheiro decimal e datas UTC. Esses caminhos precisam de validação de integração, não apenas revisão estática.

Uma etapa por vez: implementar, testar, documentar o necessário, commit e push confirmado. Não reescrever histórico, simular ferramentas ou registrar testes não executados.

## Refatoração backend

- Etapa A concluída: Models.cs separado em entidades, contratos e regras sem alteração dos 12 tipos. Skill criar-endpoint aplicada pelo agente; hook acionado manualmente com 21 unitários aprovados após corrigir o acesso local do executor. Ian confirmou 21 integrações aprovadas, zero falhas/ignorados, resumo 7,5 s e build 8,2 s.
- Etapa B: extrair rotas e tratamento de erros de Program.cs, preservando os contratos.
- Etapa C: separar consultas, criação e baixa SQL, preservando a transação.
