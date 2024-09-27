# Installation

## Install SQLite, SQLite Tools, SQLLite extension for VS Code

## Remove double quotes in SQLite extension

C:\Users\User\.vscode\extensions\alexcvzz.vscode-sqlite-0.14.1\dist\extension.js

## Install SQLite Studio

# Usefull scripts

## Create SQLite schema backup sql

```cmd

sqlite3 C:/work/m_mssql.db

.output ./backup_schema.sql
.schema
.exit

.read ./backup_schema.sql
.exit
```
