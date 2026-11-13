#!/bin/bash
set -euo pipefail
SQLCMD=/opt/mssql-tools18/bin/sqlcmd
export SQLCMDPASSWORD="$MSSQL_SA_PASSWORD"
"$SQLCMD" -S sql -U sa -C -b -l 30 -i /database/001-schema.sql
"$SQLCMD" -S sql -U sa -C -b -l 30 -i /database/002-seed.sql
