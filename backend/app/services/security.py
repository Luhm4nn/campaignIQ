import base64
import hashlib
import hmac
import os
import secrets
from typing import Optional


def _get_master_secret() -> bytes:
    raw_secret = os.getenv(
        "ENCRYPTION_SECRET",
        "campaign-iq-vault-master-key-2026-secure-storage",
    )
    return hashlib.sha256(raw_secret.encode("utf-8")).digest()


def _stream_xor(data: bytes, key: bytes, nonce: bytes) -> bytes:
    out = bytearray(len(data))
    counter = 0
    offset = 0
    while offset < len(data):
        block = hashlib.sha256(key + nonce + counter.to_bytes(8, "big")).digest()
        chunk_len = min(len(block), len(data) - offset)
        for i in range(chunk_len):
            out[offset + i] = data[offset + i] ^ block[i]
        offset += chunk_len
        counter += 1
    return bytes(out)


def encrypt_secret(plain_text: Optional[str]) -> str:
    """Encrypts a sensitive credential with authenticated stream cipher + HMAC-SHA256 before saving to DB."""
    if not plain_text or not plain_text.strip():
        return ""
    key = _get_master_secret()
    nonce = secrets.token_bytes(16)
    raw_bytes = plain_text.strip().encode("utf-8")
    cipher_bytes = _stream_xor(raw_bytes, key, nonce)
    mac = hmac.new(key, nonce + cipher_bytes, hashlib.sha256).digest()
    token = base64.urlsafe_b64encode(nonce + mac + cipher_bytes).decode("utf-8")
    return f"v1:{token}"


def decrypt_secret(cipher_text: Optional[str]) -> str:
    """Decrypts and verifies HMAC integrity of a credential from DB for internal backend use only."""
    if not cipher_text or not cipher_text.strip():
        return ""
    val = cipher_text.strip()
    if not val.startswith("v1:"):
        return ""
    try:
        raw = base64.urlsafe_b64decode(val[3:].encode("utf-8"))
        if len(raw) < 48:
            return ""
        nonce = raw[:16]
        mac = raw[16:48]
        cipher_bytes = raw[48:]
        key = _get_master_secret()
        expected_mac = hmac.new(key, nonce + cipher_bytes, hashlib.sha256).digest()
        if not hmac.compare_digest(mac, expected_mac):
            return ""
        plain_bytes = _stream_xor(cipher_bytes, key, nonce)
        return plain_bytes.decode("utf-8")
    except Exception:
        return ""


def compute_blind_index(value: Optional[str]) -> str:
    """Computes a deterministic HMAC-SHA256 blind index for secure DB indexing without exposing plain text."""
    if not value or not value.strip():
        return ""
    key = _get_master_secret()
    return hmac.new(
        key,
        value.strip().encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def mask_secret(plain_text: Optional[str]) -> str:
    """Returns a safe masked preview (e.g. '••••••••a1b2') for UI display."""
    if not plain_text:
        return ""
    cleaned = plain_text.strip()
    if len(cleaned) <= 4:
        return "••••••••"
    return f"••••••••{cleaned[-4:]}"


def generate_oauth_state() -> str:
    return secrets.token_urlsafe(24)
