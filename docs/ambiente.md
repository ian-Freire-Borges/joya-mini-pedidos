# Ambiente — inspeção real de 13/11/2026

## Atualização posterior às instalações

SDK .NET 10.0.404 e Docker CLI/Engine 29.9.3 já instalados. Ian validou Docker Server, SQL Healthy, scripts e build/inicialização da API. Frontend aguarda rebuild após correção de CSS. O terminal do agente continua bloqueado no Docker e DNS npm/NuGet. As instruções de instalação abaixo são históricas; não repetir instalações. Evidências em docs/checkpoint-inicial.md.

## Inspeção original preservada

Implementação pausada a pedido de Ian para configurar primeiro o ambiente.

| Componente | Observação real |
|---|---|
| Windows | x64, build 26200 pela API RuntimeInformation |
| Git | 2.56.0.windows.2 executado |
| Node | v24.18.0 executado |
| npm | 11.16.0 executado via npm.cmd |
| .NET | Ausente do PATH e caminho usual C:/Program Files/dotnet |
| Docker | Ausente do PATH e caminho usual C:/Program Files/Docker |
| WSL | wsl --status informa não instalado |
| winget | Alias encontrado, mas execução recusada pelo sistema neste contexto |
| Administrador | Token do terminal não elevado |
| Virtualização | Consulta CIM indisponível; não confirmada |
| Rede do terminal | Falha de resolução para dot.net, api.nuget.org e registry.npmjs.org |
| Download oficial SDK | Chrome exibiu ERR_BLOCKED_BY_CLIENT para builds.dotnet.microsoft.com |
| Download oficial Docker | Chrome exibiu ERR_BLOCKED_BY_CLIENT para desktop.docker.com |
| GitHub | Perfil aberto no Chrome; autenticação de escrita não validada |
| Git local | Repositório inicializado; identidade não configurada, nenhum commit |

Nenhum SDK, Docker ou SQL Server instalado por esta sessão. Nenhum daemon, build ou teste validado. Não foram alterados antivírus, firewall, DNS, políticas de segurança ou configurações do Windows.

## Etapa manual necessária
O terminal desta sessão não pode elevar privilégios. O usuário precisa abrir PowerShell como administrador e executar `wsl --install --no-distribution`. Revisar os prompts do Windows e reiniciar se solicitado, após salvar trabalhos. Não é necessário instalar uma distribuição Ubuntu para o backend WSL2 do Docker Desktop.

Instalar .NET 10 SDK x64 e Docker Desktop pelas fontes oficiais, ou pelo winget no terminal próprio:

```powershell
winget install --id Microsoft.DotNet.SDK.10 --exact --source winget
winget install --id Docker.DockerDesktop --exact --source winget
```

Revisar os termos de licença apresentados. Docker Desktop pode exigir licença paga conforme contexto da organização; não foi aceito contrato nem contratado plano nesta sessão. Abrir Docker Desktop e usar backend WSL2/Linux containers. Não desativar proteções para baixar arquivos; caso haja política corporativa, solicitar instalação ao administrador.

## Verificação após instalar/reiniciar
Abrir um novo terminal para recarregar PATH:

```powershell
git --version
node --version
npm.cmd --version
dotnet --info
wsl --version
docker version
docker compose version
docker run --rm hello-world
npm.cmd ping --fetch-retries=0 --fetch-timeout=10000
```

`docker version` precisa mostrar Client e Server; CLI instalado não comprova daemon ativo. Ainda será necessário testar restore NuGet, SQL Server com conexão real e permissões de volumes antes de declarar ambiente pronto.

Fontes: https://dotnet.microsoft.com/en-us/download/dotnet/10.0 ; https://docs.docker.com/desktop/setup/install/windows-install/ ; https://learn.microsoft.com/en-us/windows/wsl/install .
