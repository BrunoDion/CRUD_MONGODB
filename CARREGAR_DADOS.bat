@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo =============================================
echo   INSERIR DADOS DE EXEMPLO - MONGOLAB
 echo =============================================
echo.
echo Insere apenas IDs que ainda nao existem no banco configurado no .env.
echo.
if not exist "node_modules\mongodb" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
call npm run seed
pause
