import sys

import pytest
from fastapi.testclient import TestClient
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from coworker.server.app import create_app
from coworker.server.manager import SessionManager
from coworker.mcp.config import read_global
from coworker.vision_demo import read_demo_record, search_demo_records


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("COWORKER_STATE_DIR", str(tmp_path / "state"))
    return TestClient(create_app(SessionManager(data_dir=tmp_path / "data")))


def test_identity_roundtrip_never_enables_authentication(client):
    initial = client.get("/v1/vision/identity").json()
    config = {**initial["config"], "issuer": "https://example.okta.com/oauth2/default/", "client_id": "demo-public-client"}
    saved = client.put("/v1/vision/identity", json=config)
    assert saved.status_code == 200
    assert saved.json()["authentication_active"] is False
    assert client.get("/v1/vision/identity").json()["config"]["issuer"] == "https://example.okta.com/oauth2/default"


@pytest.mark.parametrize("changes", [
    {"issuer": "http://example.okta.com"},
    {"issuer": "https://user:secret@example.okta.com"},
    {"redirect_uri": "http://external.example/callback"},
    {"client_secret": "must-not-store"},
    {"authentication_active": True},
])
def test_identity_rejects_unsafe_or_unsupported_configuration(client, changes):
    config = client.get("/v1/vision/identity").json()["config"]
    assert client.put("/v1/vision/identity", json={**config, **changes}).status_code == 422
    assert client.get("/v1/vision/identity").json()["config"] == config


def test_demo_install_is_fixed_and_idempotent(client):
    assert client.get("/v1/vision/demo").json()["installed"] is False
    for _ in range(2):
        assert client.post("/v1/vision/demo/install").status_code == 200
    config = read_global()["vision-demo"]
    assert config["command"] == sys.executable
    assert config["args"] == ["-m", "coworker.vision_demo"]
    assert config["requires_approval"] is True
    assert len(read_global()) == 1
    assert len(client.get("/v1/vision/demo").json()["records"]) == 7


def test_demo_sources_and_unknown_record():
    result = search_demo_records("Aurora", "Jira")
    assert {r["id"] for r in result["records"]} == {"DEMO-101", "DEMO-102"}
    assert result["notice"].startswith("FICTIONAL")
    assert read_demo_record("../../secrets.json")["record"] is None


def test_vision_routes_require_sidecar_token(tmp_path, monkeypatch):
    monkeypatch.setenv("COWORKER_STATE_DIR", str(tmp_path / "state"))
    monkeypatch.setenv("COWORKER_API_TOKEN", "test-vision-token")
    guarded = TestClient(create_app(SessionManager(data_dir=tmp_path / "data")))
    assert guarded.get("/v1/vision/identity").status_code == 401
    assert guarded.post("/v1/vision/demo/install").status_code == 401
    assert guarded.get("/v1/vision/identity", headers={"X-OpenWorker-Token": "test-vision-token"}).status_code == 200


@pytest.mark.asyncio
async def test_demo_over_real_mcp_stdio():
    async with stdio_client(StdioServerParameters(command=sys.executable, args=["-m", "coworker.vision_demo"])) as (reader, writer):
        async with ClientSession(reader, writer) as session:
            await session.initialize()
            tools = await session.list_tools()
            assert {t.name for t in tools.tools} == {"search_demo_records", "read_demo_record"}
            result = await session.call_tool("read_demo_record", {"record_id": "DEMO-102"})
            assert not result.isError
            assert "FICTIONAL" in result.content[0].text
            assert "Blocked" in result.content[0].text
