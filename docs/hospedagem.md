# Hospedagem gratuita — 13/11/2026

Ian autorizou hospedar frontend e backend com custo zero. Nenhum recurso pago foi contratado. Configuração realizada nos painéis de Vercel e Render, usando o código já enviado à main, commit 19919dcfefb304c67d4cce8bd232e67cd64e31ef.

## Frontend — Vercel

- Projeto joya-mini-pedidos no workspace Hobby de Ian.
- Repositório ian-Freire-Borges/joya-mini-pedidos, branch main, diretório frontend, preset Vite.
- Verificação de identidade concluída manualmente por Ian.
- Plataforma informou Deployed to Production; página abriu em https://joya-mini-pedidos.vercel.app.
- Isso valida o build após a correção CSS e a renderização inicial desktop. Não valida funcionalidades de negócio, acessibilidade completa ou mobile.
- Consultas a clientes/produtos/pedidos retornaram 404: não há encaminhamento /api configurado para o backend externo. A UI exibiu mensagem de erro e desabilitou a criação sem catálogo. Não registrar esse resultado como integração aprovada.

## Backend — Render

- Serviço joya-mini-pedidos-api, runtime Docker, branch main.
- Plano selecionado e conferido: Free, US$ 0/mês, 0,1 CPU e 512 MB de RAM.
- Dockerfile backend/Dockerfile, contexto de build na raiz, Root Directory vazio.
- ASPNETCORE_ENVIRONMENT=Production; nenhuma senha de banco foi inventada nem enviada.
- Restore e publish concluíram no Render, imagem exportada e container iniciou ouvindo em 8080.
- Endereço atribuído: https://joya-mini-pedidos-api.onrender.com.
- Publicação verificada: /api/openapi/v1.json respondeu com o documento JSON de Pedidos.Api v1, OpenAPI 3.1.1, em https://joya-mini-pedidos-api.onrender.com/api/openapi/v1.json. Isso confirma resposta HTTP da aplicação, sem comprovar conexão ao banco.
- O documento gerado anuncia servidor http apesar da entrada pública HTTPS e descreve POST como 200 em vez do contrato 201. Corrigir e testar metadados/forwarded headers em uma etapa própria; não é aprovação completa do contrato OpenAPI.
- Nenhuma ConnectionStrings__Pedidos foi configurada: falta um SQL Server externo provisionado com schema/seed. O banco local do Docker não está acessível pela nuvem.

## Próxima etapa bloqueante

Atualização 13/11/2026: SQL Server externo provisionado na Somee, banco JoyaPedidos, servidor JoyaPedidos.mssql.somee.com, SQL Server 2022 Express, Free hosting package, capacidade de dados 30 MB. Schema aplicado pelo console T-SQL a partir de database/001-schema.sql, sem CREATE DATABASE/USE/GO porque o painel já seleciona o banco. Seed aplicado a partir de database/002-seed.sql. Consulta independente confirmou 6 clientes, 4 produtos, 6 pedidos e 6 itens. Nenhuma senha registrada neste arquivo ou no Git. Conexão no Render e teste HTTP integrado ainda pendentes; criação do banco não comprova acesso externo pela API.

Após autorização específica de Ian, ConnectionStrings__Pedidos cadastrada no Render com Encrypt=True e TrustServerCertificate=False. Deploy dep-dbrk4unf3r2c73fns840 concluído Live a partir de ac0a608, confirmando recebimento remoto do commit. Teste após deploy: /api/health retornou 503 e /api/clientes 500. Logs demonstram conexão TCP estabelecida e falha TLS Certificate name mismatch: hostname informado não corresponde ao certificado. Não é evidência de senha inválida nem de firewall bloqueando TCP. Integração permanece bloqueada; validação de certificado não foi desabilitada. A conexão sugerida pelo painel Somee usa TrustServerCertificate=True; aplicar essa exceção depende de confirmação explícita, por reduzir a verificação da identidade do servidor.

Provisionar SQL Server gratuito e confirmar hostname, banco e usuário sem expor credenciais no chat ou no Git. Depois inicializar schema/seed, configurar conexão segura no Render, testar health e operações reais e encaminhar /api na Vercel. Sem essa integração, a aplicação completa não está pronta.

O Render gratuito pode adormecer por inatividade. Não foi contratado disco ou banco pago. Vercel publica frontend estático; o Docker Compose continua sendo a execução local e não foi enviado como uma stack inteira ao Render.

## Controle de mudanças

### Correção TLS da Somee — 13/11/2026

Ian rejeitou desabilitar a validação do certificado; TrustServerCertificate permanece False. Diagnóstico sem credenciais executado no PowerShell de Ian identificou Subject/SAN vb4400.mgmt.somee.com, emissor Let's Encrypt YR1, validade até 2026-11-16T13:17:56Z e somente RemoteCertificateNameMismatch. Nome de máquina consultado no painel Somee: vb4400. Configuração corrigida no segredo Render: Encrypt=True;TrustServerCertificate=False;HostNameInCertificate=vb4400.mgmt.somee.com. O endpoint do banco permanece JoyaPedidos.mssql.somee.com. HostNameInCertificate define a identidade esperada; não ignora cadeia, validade ou correspondência do certificado. A renovação do certificado é responsabilidade da Somee; validade observada não garante renovação futura. Deploy dep-dbrk85d6e07s73bvnhdg iniciado; resultado HTTP deve ser confirmado antes de declarar integração aprovada.

Nenhum código funcional foi alterado para estes dois deploys. Registro conferido com as telas reais e diff validado; autoria local corrigida Ian Freire Borges / ianxofreire@gmail.com. Confirmar push desta documentação antes de avançar de etapa. Não há merge nem suíte de testes aprovada nesta publicação.

Resultado final TLS: a primeira edição do formulário não persistiu HostNameInCertificate; conferência do valor salvo detectou a ausência, sem divulgar credenciais. Reaplicado o parâmetro com evento de edição e publicado no deploy dep-dbrk8pec6qcc73e59450, Live, commit ac0a608. Após esse deploy, /api/health respondeu {"status":"ok"}; /api/clientes retornou seis clientes; /api/relatorios/top-clientes retornou cinco clientes, com Diego 749,50, Carla 599,60, Bruno 449,70 e os dois IDs de Ana Silva 299,80. Confirma conexão Render–Somee e execução dessas consultas com Encrypt=True, TrustServerCertificate=False e HostNameInCertificate=vb4400.mgmt.somee.com. Nenhum POST, rollback ou concorrência foi exercitado. Encaminhamento /api da Vercel continua pendente, portanto o frontend público integrado ainda não está aprovado. Referência: https://learn.microsoft.com/en-us/sql/connect/ado-net/connection-strings (Host Name In Certificate).
