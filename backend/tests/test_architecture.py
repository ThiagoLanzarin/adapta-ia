"""The server layers (docs/arquitetura.md, section 4), checked on every test run."""

import ast
from pathlib import Path

import pytest

APP = Path(__file__).resolve().parents[1] / "app"

# What each layer must never import (prefix match on the module name).
FORBIDDEN = {
    "api": ["app.ai_providers.gemini", "app.pictogram_providers.arasaac", "google", "httpx"],
    "services": [
        "fastapi",
        "httpx",
        "google",
        "app.api",
        "app.ai_providers.gemini",
        "app.pictogram_providers.arasaac",
    ],
    "ai_providers": ["app.services", "app.api", "fastapi"],
    "pictogram_providers": ["app.services", "app.api", "fastapi"],
    "readers": ["app.services", "app.api", "fastapi"],
    "models": [
        "app.services",
        "app.api",
        "app.ai_providers",
        "app.pictogram_providers",
        "app.readers",
        "fastapi",
        "httpx",
        "google",
    ],
}


def imported_modules(path: Path) -> set[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            names.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            names.add(node.module)
    return names


@pytest.mark.parametrize("layer", sorted(FORBIDDEN))
def test_layer_does_not_import_forbidden_modules(layer):
    violations = [
        f"{path.relative_to(APP)} importa {module}"
        for path in (APP / layer).rglob("*.py")
        for module in imported_modules(path)
        if any(module == bad or module.startswith(bad + ".") for bad in FORBIDDEN[layer])
    ]

    assert violations == []


def test_services_never_mention_gemini():
    mentions = [
        path.name
        for path in (APP / "services").rglob("*.py")
        if "gemini" in path.read_text(encoding="utf-8").lower()
    ]

    assert mentions == []
