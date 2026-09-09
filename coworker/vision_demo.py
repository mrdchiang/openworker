"""Offline, read-only MCP pitch fixture. All records are invented, not MACOM data."""

from mcp.server.fastmcp import FastMCP

NOTICE = "FICTIONAL DEMO DATA. Not real MACOM products, projects, people, or specifications."
RECORDS = [
    {"id": "DEMO-101", "source": "Jira", "title": "Aurora evaluation board: thermal validation", "body": "Project Aurora is a fictional RF evaluation board. Status: In progress. Owner: Demo Engineering. Thermal sweep is complete at room temperature; elevated-temperature measurements remain open. Target review: 2026-09-18. Blocker: chamber calibration (DEMO-102)."},
    {"id": "DEMO-102", "source": "Jira", "title": "Aurora chamber calibration", "body": "Status: Blocked. Owner: Demo Lab Operations. Calibration certificate for chamber DEMO-CH-04 has expired. Recalibration is scheduled for 2026-09-14. Do not report thermal qualification as complete. This blocks DEMO-101."},
    {"id": "DEMO-SP-01", "source": "Microsoft 365", "title": "Aurora weekly project review", "body": "Fictional SharePoint document, revision 3, 2026-09-09. Aurora board assembly is complete. Firmware review is complete with one documentation follow-up. Thermal qualification is pending calibration and elevated-temperature measurements. Next gate: engineering readiness review on 2026-09-18. Risk: calibration delay may move the gate. Sources: DEMO-101, DEMO-102, DEMO-GH-01."},
    {"id": "DEMO-DS-A", "source": "Engineering knowledge", "title": "DEMO-RF-100 datasheet revision A", "body": "Invented device for demonstration only. Frequency: 2.0–3.0 GHz. Typical gain: 18 dB. Supply: 5.0 V. Evaluation temperature: 25 C only. Maximum evaluation current: 120 mA. No production qualification implied."},
    {"id": "DEMO-DS-B", "source": "Engineering knowledge", "title": "DEMO-RF-100 datasheet revision B", "body": "Invented device for demonstration only. Frequency: 2.0–3.0 GHz. Typical gain: 19 dB. Supply: 5.0 V. Evaluation temperature: 25 C only. Maximum evaluation current: 135 mA. Adds a recommended 100 nF local bypass capacitor. No production qualification implied. Differences from revision A: gain, current limit, bypass recommendation."},
    {"id": "DEMO-GH-01", "source": "GitHub", "title": "Aurora firmware pull request 42", "body": "Fictional repository demo/aurora-firmware. Pull request: add temperature telemetry. Status: merged in demo fixture. Unit checks: passed. Follow-up: document sensor offset in the lab procedure. No live repository is connected."},
    {"id": "DEMO-INV-01", "source": "Internal inventory", "title": "Chamber DEMO-CH-04", "body": "Fictional asset. Location: Demo Lab A. Custodian: Demo Lab Operations. Calibration status: expired. Scheduled service: 2026-09-14. Linked ticket: DEMO-102. Not available for qualification measurements until calibration is complete."},
]

mcp = FastMCP("Vision fictional engineering demo")


@mcp.tool()
def search_demo_records(query: str, source: str = "") -> dict:
    """Search fictional Jira, Microsoft 365, engineering, GitHub, and inventory records. Returns source IDs for citation. No real systems are accessed."""
    terms = query.lower().split()
    hits = [r for r in RECORDS if (not source or source.lower() == r["source"].lower())
            and (not terms or any(t in (r["title"] + " " + r["body"] + " " + r["id"]).lower() for t in terms))]
    return {"notice": NOTICE, "records": hits}


@mcp.tool()
def read_demo_record(record_id: str) -> dict:
    """Retrieve one fictional record by its exact DEMO ID. No filesystem or network access."""
    record = next((r for r in RECORDS if r["id"] == record_id), None)
    return {"notice": NOTICE, "record": record, "error": None if record else "Unknown demo record ID"}


if __name__ == "__main__":
    mcp.run(transport="stdio")
