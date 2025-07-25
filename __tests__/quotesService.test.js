import { jest } from "@jest/globals";

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test("getAllQuotes fetches quotes", async () => {
  const rows = [{ id: 1 }];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule("../lib/db.js", () => ({
    default: { query: queryMock },
  }));
  const { getAllQuotes } = await import("../services/quotesService.js");
  const result = await getAllQuotes();
  expect(queryMock).toHaveBeenCalledTimes(1);
  expect(queryMock.mock.calls[0][0]).toMatch(/FROM quotes/);
  expect(result).toEqual(rows);
});

test("getQuoteById fetches single quote", async () => {
  const row = { id: 2 };
  const queryMock = jest.fn().mockResolvedValue([[row]]);
  jest.unstable_mockModule("../lib/db.js", () => ({
    default: { query: queryMock },
  }));
  const { getQuoteById } = await import("../services/quotesService.js");
  const result = await getQuoteById(2);
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/WHERE id=\?/), [
    2,
  ]);
  expect(result).toEqual(row);
});

test("getQuotesByJob fetches quotes for job", async () => {
  const rows = [{ id: 4 }];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule("../lib/db.js", () => ({
    default: { query: queryMock },
  }));
  const { getQuotesByJob } = await import("../services/quotesService.js");
  const result = await getQuotesByJob(5);
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/WHERE job_id=\?/),
    [5],
  );
  expect(result).toEqual(rows);
});

test("createQuote inserts quote", async () => {
  const queryMock = jest
    .fn()
    .mockResolvedValueOnce([[{ company_vehicle_id: "F1" }]])
    .mockResolvedValueOnce([[{ rev: 2 }]])
    .mockResolvedValueOnce([{ insertId: 3 }]);
  jest.unstable_mockModule("../lib/db.js", () => ({
    default: { query: queryMock },
  }));
  const settingsMock = jest.fn().mockResolvedValue({ quote_terms: "QT" });
  jest.unstable_mockModule("../services/companySettingsService.js", () => ({
    getSettings: settingsMock,
  }));
  const { createQuote } = await import("../services/quotesService.js");
  const data = {
    customer_id: 1,
    fleet_id: 2,
    job_id: 3,
    vehicle_id: 4,
    customer_reference: "ref",
    po_number: "PO123",
    defect_description: "d",
    total_amount: 50,
    status: "new",
  };
  const result = await createQuote(data);
  expect(queryMock).toHaveBeenNthCalledWith(
    1,
    expect.stringMatching(/SELECT company_vehicle_id/),
    [4],
  );
  expect(queryMock).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(/MAX\(revision\)/),
    [3],
  );
  expect(queryMock).toHaveBeenNthCalledWith(
    3,
    expect.stringMatching(/INSERT INTO quotes/),
    [1, 2, 3, 3, 4, "F1", "ref", "PO123", "d", 50, "new", "QT"],
  );
  expect(result).toEqual({
    id: 3,
    ...data,
    fleet_vehicle_id: "F1",
    revision: 3,
    terms: "QT",
  });
});

test("updateQuote updates row", async () => {
  const queryMock = jest
    .fn()
    .mockResolvedValueOnce([[{ company_vehicle_id: "F2" }]])
    .mockResolvedValueOnce([]);
  jest.unstable_mockModule("../lib/db.js", () => ({
    default: { query: queryMock },
  }));
  const { updateQuote } = await import("../services/quotesService.js");
  const data = {
    customer_id: 4,
    fleet_id: 5,
    job_id: 6,
    vehicle_id: 7,
    revision: 2,
    customer_reference: "r",
    po_number: "PO",
    defect_description: "dd",
    total_amount: 8,
    status: "sent",
  };
  const result = await updateQuote(9, data);
  expect(queryMock).toHaveBeenNthCalledWith(
    1,
    expect.stringMatching(/SELECT company_vehicle_id/),
    [7],
  );
  expect(queryMock).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(/UPDATE quotes/),
    [4, 5, 6, 2, 7, "F2", "r", "PO", "dd", 8, "sent", null, 9],
  );
  expect(result).toEqual({ ok: true });
});

test("deleteQuote removes row", async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule("../lib/db.js", () => ({
    default: { query: queryMock },
  }));
  const { deleteQuote } = await import("../services/quotesService.js");
  const result = await deleteQuote(8);
  expect(queryMock).toHaveBeenCalledWith("DELETE FROM quotes WHERE id=?", [8]);
  expect(result).toEqual({ ok: true });
});

test("updateQuote preserves existing fields when omitted", async () => {
  const existing = {
    id: 9,
    customer_id: 4,
    fleet_id: 5,
    job_id: 6,
    vehicle_id: 7,
    fleet_vehicle_id: "F2",
    customer_reference: "r",
    po_number: "PO",
    defect_description: "dd",
    total_amount: 8,
    status: "sent",
    terms: null,
    revision: 1,
  };
  const queryMock = jest
    .fn()
    .mockResolvedValueOnce([[existing]])
    .mockResolvedValueOnce([]);
  jest.unstable_mockModule("../lib/db.js", () => ({
    default: { query: queryMock },
  }));
  const { updateQuote } = await import("../services/quotesService.js");
  const result = await updateQuote(9, { status: "approved" });
  expect(queryMock).toHaveBeenNthCalledWith(
    1,
    expect.stringMatching(/FROM quotes/),
    [9],
  );
  expect(queryMock).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(/UPDATE quotes/),
    [4, 5, 6, 1, 7, "F2", "r", "PO", "dd", 8, "approved", null, 9],
  );
  expect(result).toEqual({ ok: true });
});
