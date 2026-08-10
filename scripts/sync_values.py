#!/usr/bin/env python3
"""Full value sync from Traderie."""

from __future__ import annotations

import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main() -> None:
    runpy.run_path(str(ROOT / "sync_traderie.py"), run_name="__main__")


if __name__ == "__main__":
    main()
