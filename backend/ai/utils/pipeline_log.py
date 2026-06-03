"""Concise terminal status for the blog generation pipeline."""


def log_status(message: str) -> None:
    print(f"[blog] {message}", flush=True)


def log_warn(message: str) -> None:
    print(f"[blog] warning: {message}", flush=True)
