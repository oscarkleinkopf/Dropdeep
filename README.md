# Dropdeep

Proyecto en preparación. El código fuente vive por ahora en tu máquina local
(`silly-meitner`) y hay que importarlo a este repositorio para seguir
desarrollando desde Cursor Cloud / GitHub.

## Importar el proyecto local (Windows)

Abre **PowerShell** y ejecuta:

```powershell
cd C:\Users\oscar\Documents\antigravity\silly-meitner

# Si la carpeta aún no es un repo git:
if (-not (Test-Path .git)) { git init }

git remote remove origin 2>$null
git remote add origin https://github.com/oscarkleinkopf/Dropdeep.git

git add .
git status
git commit -m "Import silly-meitner as Dropdeep"

git branch -M main
git push -u origin main --force
```

`--force` reemplaza el commit inicial (solo README) por tu proyecto local.
Úsalo solo si confirmas que Dropdeep debe ser este código.

### Después del push

1. Abre de nuevo el agente sobre [Dropdeep](https://github.com/oscarkleinkopf/Dropdeep).
2. Indica qué quieres construir o cambiar a continuación.
