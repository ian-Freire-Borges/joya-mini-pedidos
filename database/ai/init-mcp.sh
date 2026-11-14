#!/bin/bash
set -euo pipefail
export SQLCMDPASSWORD="$MSSQL_SA_PASSWORD"
/opt/mssql-tools18/bin/sqlcmd -S sql -U sa -C -b -l 30 -i /database/ai/readonly-mcp.sql
