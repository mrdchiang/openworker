import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { VisionCatalog } from "./VisionCatalog";

vi.mock("../api", () => ({
  visionRequest: vi.fn(async () => ({ installed: false, records: [], notice: "FICTIONAL" })),
  getMcpTools: vi.fn(async () => ({ ok: false, error: "Server unavailable", tools: [] })),
}));
afterEach(cleanup);

it("filters the curated catalog without implying a live connection", async () => {
  render(<VisionCatalog onAdministration={() => {}} />);
  expect(await screen.findByRole("button", { name: "Enable demo tools" })).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Search tool catalog"), { target: { value: "Microsoft" } });
  expect(screen.getByRole("heading", { name: "Microsoft 365" })).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "Jira" })).toBeNull();
  expect(screen.getByText("Setup required")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Filter catalog category"), { target: { value: "Engineering" } });
  expect(screen.getByRole("status").textContent).toContain("No tools match");
});

it("does not claim verification when the MCP connection test fails", async () => {
  render(<VisionCatalog onAdministration={() => {}} />);
  const button = await screen.findByRole("button", { name: "Enable demo tools" });
  // Wait for fixture loading to enable the action.
  await vi.waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
  fireEvent.click(button);
  expect((await screen.findByRole("alert")).textContent).toContain("Server unavailable");
  expect(screen.queryByText("Connection verified this visit")).toBeNull();
});
