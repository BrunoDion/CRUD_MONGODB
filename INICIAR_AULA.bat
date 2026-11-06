@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo =============================================
echo   MONGOLAB - CRUD DE CLIENTES
 echo =============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo ERRO: Node.js nao encontrado. Instale em https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules\mongodb" (
  echo Instalando dependencias pela primeira vez...
  call npm install
  if errorlevel 1 (
    echo ERRO ao instalar. Confira conexao com a internet.
    pause
    exit /b 1
  )
)
echo.
echo Acesse http://localhost:3000 quando o servidor iniciar.
echo Para finalizar, pressione Ctrl+C.
echo.
call npm start
pause
