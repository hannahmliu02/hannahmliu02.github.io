#!/usr/bin/env python3
"""Encrypt the private workbench notes for the password-protected /workbench/ page.

Reads   private/workbench.yaml          (plaintext, ignored by git)
Writes  static/workbench/data.enc.json  (encrypted, safe to commit)

The notes are rendered from Markdown, bundled as JSON, and encrypted with AES-256-GCM using a key
derived from your password (PBKDF2-SHA256, 600,000 iterations). The page decrypts them in the browser.

Usage:
    /opt/anaconda3/bin/python scripts/encrypt-workbench.py
Needs PyYAML, Markdown and cryptography (all included with Anaconda), or:
    python3 -m pip install pyyaml markdown cryptography
"""
import base64
import getpass
import json
import os
import subprocess
import sys
from pathlib import Path

try:
    import markdown
    import yaml
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
except ImportError as e:
    sys.exit(f"Missing a Python package ({e.name}). Run this with /opt/anaconda3/bin/python, "
             "or install them with: python3 -m pip install pyyaml markdown cryptography")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "private" / "workbench.yaml"
OUT = Path(os.environ.get("WORKBENCH_OUT") or ROOT / "static" / "workbench" / "data.enc.json")
ITERATIONS = 600_000
MIN_PASSWORD = 12


def check_source_is_private():
    """Refuse to run if the plaintext would be committed to the public repo."""
    rel = SRC.relative_to(ROOT)
    ignored = subprocess.run(["git", "check-ignore", "-q", str(rel)], cwd=ROOT).returncode == 0
    tracked = subprocess.run(["git", "ls-files", "--error-unmatch", str(rel)], cwd=ROOT,
                             capture_output=True).returncode == 0
    if not ignored or tracked:
        sys.exit(f"{rel} is not ignored by git (or is already tracked). Fix .gitignore before encrypting, "
                 "so your plaintext notes never reach GitHub.")


def build_payload():
    data = yaml.safe_load(SRC.read_text(encoding="utf-8")) or {}
    md = markdown.Markdown(extensions=["extra", "sane_lists"])
    ids = {item["id"] for item in data.get("items", [])}
    for item in data.get("items", []):
        item["notes_html"] = md.reset().convert(item.pop("notes", "") or "")
        for c in item.get("connections") or []:
            if c.get("to") not in ids:
                sys.exit(f"Item '{item['id']}' connects to '{c.get('to')}', which isn't an item id.")
    pk = data.get("packages") or {}
    pk_ids = {p["id"] for p in pk.get("items", [])}
    for p in pk.get("items", []):
        p["notes_html"] = md.reset().convert(p.pop("notes", "") or "")
    for l in pk.get("links", []):
        if l.get("a") not in pk_ids or l.get("b") not in pk_ids:
            sys.exit(f"A package link points at an unknown package id: {l.get('a')} / {l.get('b')}.")
    if data.get("updated") is not None:  # YAML reads dates as date objects
        data["updated"] = str(data["updated"])
    return json.dumps(data, ensure_ascii=False).encode("utf-8")


def read_password():
    pw = os.environ.get("WORKBENCH_PASSWORD")
    if pw:
        return pw
    pw = getpass.getpass("Workbench password: ")
    if len(pw) < MIN_PASSWORD:
        sys.exit(f"Use at least {MIN_PASSWORD} characters. Anyone can download the encrypted file and "
                 "try passwords offline, so a long passphrase (four or five random words) is best.")
    if getpass.getpass("Type it again: ") != pw:
        sys.exit("The passwords didn't match. Nothing was written.")
    return pw


def main():
    check_source_is_private()
    plaintext = build_payload()
    password = read_password()
    salt, iv = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITERATIONS).derive(
        password.encode("utf-8"))
    ciphertext = AESGCM(key).encrypt(iv, plaintext, None)  # tag appended, as WebCrypto expects
    b64 = lambda b: base64.b64encode(b).decode("ascii")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"v": 1, "kdf": "PBKDF2-SHA256", "iterations": ITERATIONS,
                               "salt": b64(salt), "iv": b64(iv), "ciphertext": b64(ciphertext)}) + "\n")
    print(f"Encrypted {SRC.relative_to(ROOT)} -> {OUT} ({len(plaintext):,} bytes of notes).")
    print("Commit and push static/workbench/data.enc.json to publish the update.")


if __name__ == "__main__":
    main()
