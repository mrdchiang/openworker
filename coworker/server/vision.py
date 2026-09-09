"""Vision pitch configuration. No identity enforcement or remote credential collection."""

import json
import sys
from urllib.parse import urlsplit

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..mcp.config import put_global_server, read_global
from ..secrets import state_dir, write_private_text
from ..vision_demo import NOTICE, RECORDS

router = APIRouter(prefix="/v1/vision")
DEMO_SERVER = "vision-demo"
DEMO_IDENTITIES = {
    "alex.chen@macom-demo.local": "user",
    "priya.shah@macom-demo.local": "developer",
    "morgan.lee@macom-demo.local": "administrator",
    "sam.rivera@macom-demo.local": "security",
}

def _demo_role() -> str:
    path = state_dir() / "vision-demo-identity.json"
    email = path.read_text(encoding="utf-8").strip() if path.exists() else "alex.chen@macom-demo.local"
    return DEMO_IDENTITIES.get(email, "user")

def _require_demo_admin() -> None:
    if _demo_role() != "administrator":
        raise HTTPException(403, "Administrator demo identity required")


class IdentityConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    issuer: str = Field(default="", max_length=512)
    client_id: str = Field(default="", max_length=256)
    redirect_uri: str = Field(default="http://127.0.0.1:8765/oidc/callback", max_length=512)
    groups_claim: str = Field(default="groups", max_length=128)
    employee_group: str = Field(default="vision-users", max_length=128)
    administrator_group: str = Field(default="vision-admins", max_length=128)
    developer_group: str = Field(default="vision-developers", max_length=128)

    @field_validator("issuer")
    @classmethod
    def valid_issuer(cls, value: str) -> str:
        value = value.strip().rstrip("/")
        if value:
            parts = urlsplit(value)
            if parts.scheme != "https" or not parts.hostname or parts.username or parts.password or parts.query or parts.fragment:
                raise ValueError("Issuer must be an HTTPS URL without credentials, query, or fragment")
        return value

    @field_validator("redirect_uri")
    @classmethod
    def valid_redirect(cls, value: str) -> str:
        value = value.strip()
        parts = urlsplit(value)
        if (not parts.hostname or parts.username or parts.password or parts.fragment or parts.query
                or not (parts.scheme == "https" or (parts.scheme == "http" and parts.hostname in {"localhost", "127.0.0.1"}))):
            raise ValueError("Redirect must be HTTPS or a local loopback HTTP URL")
        return value


@router.get("/identity")
def get_identity():
    path = state_dir() / "vision-identity.json"
    try:
        config = IdentityConfig.model_validate_json(path.read_text(encoding="utf-8")) if path.exists() else IdentityConfig()
    except (ValueError, OSError) as exc:
        raise HTTPException(500, "Saved identity configuration could not be read") from exc
    return {"config": config.model_dump(), "authentication_active": False}


@router.put("/identity")
def save_identity(config: IdentityConfig):
    write_private_text(state_dir() / "vision-identity.json", json.dumps(config.model_dump(), indent=2))
    return {"config": config.model_dump(), "authentication_active": False}

@router.get("/demo-identity")
def get_demo_identity():
    path = state_dir() / "vision-demo-identity.json"
    email = path.read_text(encoding="utf-8").strip() if path.exists() else "alex.chen@macom-demo.local"
    if email not in DEMO_IDENTITIES:
        email = "alex.chen@macom-demo.local"
    return {"email": email, "role": DEMO_IDENTITIES[email], "demo_only": True}

class DemoIdentity(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str

    @field_validator("email")
    @classmethod
    def known_identity(cls, value: str) -> str:
        if value not in DEMO_IDENTITIES:
            raise ValueError("Unknown demo identity")
        return value

@router.put("/demo-identity")
def set_demo_identity(identity: DemoIdentity):
    write_private_text(state_dir() / "vision-demo-identity.json", identity.email)
    return {"email": identity.email, "role": DEMO_IDENTITIES[identity.email], "demo_only": True}

@router.get("/policy")
def get_policy():
    return {"role": _demo_role(), "curated_servers": [DEMO_SERVER], "custom_servers_allowed": _demo_role() == "administrator"}

@router.put("/policy")
def update_policy(body: dict):
    _require_demo_admin()
    return {"ok": True, "role": _demo_role(), "curated_servers": [DEMO_SERVER], "custom_servers_allowed": False}


@router.get("/demo")
def demo_status():
    return {"notice": NOTICE, "records": RECORDS, "installed": DEMO_SERVER in read_global()}


@router.post("/demo/install")
def install_demo():
    # Fixed in-package server only: the catalog does not accept executable paths or URLs.
    if getattr(sys, "frozen", False):
        raise HTTPException(501, "The demo MCP sidecar must be bundled before use in a packaged installer")
    existing = read_global().get(DEMO_SERVER)
    if existing and (existing.get("command") != sys.executable or existing.get("args") != ["-m", "coworker.vision_demo"]):
        raise HTTPException(409, "A different server already uses the vision-demo name; review it in connection administration")
    if existing is None:
        put_global_server(DEMO_SERVER, {
            "command": sys.executable,
            "args": ["-m", "coworker.vision_demo"],
            "enabled": True,
            "requires_approval": True,
            "include_tools": ["search_demo_records", "read_demo_record"],
        })
    return {"ok": True, "server": DEMO_SERVER}
