# EcoTij — comunidad ecológica de Tijuana

Sitio de demostración para aprender y explorar acciones ecológicas locales. La versión para GitHub Codespaces usa Python Flask, plantillas Jinja y archivos locales de CSS y JavaScript. No utiliza una API de negocio, base de datos, cuentas ni servicios externos.

## Abrir en GitHub Codespaces

Crea o vuelve a abrir un Codespace del repositorio. `.devcontainer/devcontainer.json` crea un entorno virtual Python e instala Flask desde `requirements.txt`. El comando de inicio levanta la aplicación en el puerto 5000; Codespaces lo reenvía y abre el navegador. Si no se abre automáticamente, visita el puerto 5000 desde la pestaña **Ports** de VS Code.

La ruta `/healthz` devuelve `{"status":"ok"}`. El log del servidor se guarda en `/tmp/ecotij-flask.log` dentro del Codespace.

## Ejecutar localmente

Se requiere Python 3.12 o compatible. Desde la raíz del repositorio:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Abre `http://localhost:5000`. Si defines la variable `PORT`, Flask usará ese puerto en vez del 5000.

## Estructura principal

- `app.py`: rutas Flask para la página, el manifiesto y la comprobación de salud.
- `templates/`: plantilla base, página y secciones parciales Jinja.
- `static/css/style.css`: estilos de EcoTij.
- `static/js/main.js`: navegación, filtros, perfiles e interacciones temporales.
- `static/images/`: fotos y distintivo local.
- `requirements.txt`: dependencia Flask.
- `.devcontainer/devcontainer.json`: entorno reproducible de Codespaces.

El código anterior de React/Vite en `client/` y `package.json` se conserva como fuente heredada; la versión Flask no lo importa ni necesita instalar Node para ejecutarse.
