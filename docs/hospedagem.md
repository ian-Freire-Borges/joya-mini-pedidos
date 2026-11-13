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

Provisionar SQL Server gratuito e confirmar hostname, banco e usuário sem expor credenciais no chat ou no Git. Depois inicializar schema/seed, configurar conexão segura no Render, testar health e operações reais e encaminhar /api na Vercel. Sem essa integração, a aplicação completa não está pronta.

O Render gratuito pode adormecer por inatividade. Não foi contratado disco ou banco pago. Vercel publica frontend estático; o Docker Compose continua sendo a execução local e não foi enviado como uma stack inteira ao Render.

## Controle de mudanças

Nenhum código funcional foi alterado para estes dois deploys. Registro conferido com as telas reais e diff validado; autoria local corrigida Ian Freire Borges / ianxofreire@gmail.com. Confirmar push desta documentação antes de avançar de etapa. Não há merge nem suíte de testes aprovada nesta publicação.
