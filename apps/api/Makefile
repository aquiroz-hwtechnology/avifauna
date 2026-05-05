.PHONY: install dev test

install:
	python -m venv .venv
	.venv\Scripts\pip install -e ".[dev]"

dev:
	.venv\Scripts\uvicorn src.main:app --reload --port 8000

test:
	.venv\Scripts\pytest tests/ -v
