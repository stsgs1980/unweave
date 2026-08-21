import { describe, it, expect, beforeEach } from "vitest";
import { logger, getLogs, clearLogs, addLogEntry } from "../lib/logger";

describe("Web: Persistent Logger", () => {
  beforeEach(() => {
    clearLogs();
  });

  it("should record log entries with timestamps and levels", () => {
    logger.info("TestModule", "Informational test message", { foo: "bar" });
    logger.warn("TestModule", "Warning test message");
    logger.error("ErrorModule", "Error test message", new Error("Sample failure"));

    const logs = getLogs();
    expect(logs.length).toBe(3);

    expect(logs[0].level).toBe("info");
    expect(logs[0].module).toBe("TestModule");
    expect(logs[0].message).toBe("Informational test message");
    expect(logs[0].data).toEqual({ foo: "bar" });

    expect(logs[1].level).toBe("warn");
    expect(logs[2].level).toBe("error");
    expect(logs[2].module).toBe("ErrorModule");
  });

  it("should filter logs by level and module", () => {
    logger.info("ModuleA", "Message 1");
    logger.warn("ModuleA", "Message 2");
    logger.error("ModuleB", "Message 3");

    const errorLogs = getLogs({ level: "error" });
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0].message).toBe("Message 3");

    const moduleALogs = getLogs({ module: "ModuleA" });
    expect(moduleALogs.length).toBe(2);
  });

  it("should support adding entries directly from worker messages", () => {
    addLogEntry({
      timestamp: new Date().toISOString(),
      level: "info",
      module: "Worker",
      message: "Worker log forwarding test",
    });

    const logs = getLogs({ module: "Worker" });
    expect(logs.length).toBe(1);
    expect(logs[0].message).toBe("Worker log forwarding test");
  });

  it("should clear logs cleanly", () => {
    logger.info("Test", "Entry");
    expect(getLogs().length).toBe(1);
    clearLogs();
    expect(getLogs().length).toBe(0);
  });
});
