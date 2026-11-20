"""Aplicación Flask de EcoTij para Codespaces."""

from __future__ import annotations

import os
from pathlib import Path

from flask import Flask, jsonify, render_template, send_from_directory

PROJECT_ROOT = Path(__file__).resolve().parent
STATIC_DIR = PROJECT_ROOT / "static"

app = Flask(__name__, static_folder=str(STATIC_DIR), template_folder=str(PROJECT_ROOT / "templates"))


@app.get("/")
def home():
    """Renderiza la interfaz EcoTij desde plantillas Jinja."""
    return render_template("index.html")


@app.get("/healthz")
def health_check():
    """Permite comprobar que Flask arrancó."""
    return jsonify(status="ok")


@app.get("/manus-routes.json")
def route_manifest():
    """Sirve el manifiesto estático de la única página principal."""
    return send_from_directory(STATIC_DIR, "manus-routes.json", mimetype="application/json")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)
