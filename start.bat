@echo off
:: ─────────────────────────────────────────
::  Origami Seed — Inicializador Windows
:: ─────────────────────────────────────────

set PORT=8080
set URL=http://localhost:%PORT%

echo.
echo  🦢  Origami Seed
echo  ──────────────────────────────
echo.

:: Verifica se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌  Python nao encontrado.
    echo.
    echo  Instale em: https://www.python.org/downloads/
    echo  Marque "Add Python to PATH" durante a instalacao.
    echo.
    echo  Ou abra o index.html diretamente no browser.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYVER=%%i
echo  ✓   %PYVER% encontrado
echo  ✓   Iniciando servidor em %URL%
echo.
echo  ⚠   Dica: ative o modo aviao antes de gerar seeds reais.
echo.
echo  Feche esta janela ou pressione Ctrl+C para encerrar.
echo  ──────────────────────────────
echo.

:: Abre o browser após 1 segundo
timeout /t 1 /nobreak >nul
start "" "%URL%"

:: Inicia o servidor
python -m http.server %PORT%

pause
