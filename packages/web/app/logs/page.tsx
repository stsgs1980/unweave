"use client";

/**
 * @file Logs page for viewing application logs.
 */

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, RefreshCw, Trash2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogEntry, LogEntryRow } from "./components/LogEntryRow";

/**
 *
 */
export default function LogsPage() {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const {
    data: logs,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<LogEntry[]>({
    queryKey: ["logs"],
    queryFn: async (): Promise<LogEntry[]> => {
      const response = await fetch("/api/logs");
      if (!response.ok) throw new Error("Failed to load logs");
      return response.json();
    },
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (isError && error) toast.error(error.message);
  }, [isError, error]);

  const logsData = logs ?? [];

  const filteredLogs = logsData.filter((log) => {
    if (levelFilter !== "all" && log.level !== levelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchMod = log.module.toLowerCase().includes(q);
      const matchData = log.data ? JSON.stringify(log.data).toLowerCase().includes(q) : false;
      return matchMsg || matchMod || matchData;
    }
    return true;
  });

  const handleClearLogs = async () => {
    try {
      const response = await fetch("/api/logs", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to clear logs");
      toast.success("Logs cleared");
      refetch();
    } catch {
      toast.error("Failed to clear logs");
    }
  };

  return (
    <main className="flex h-[calc(100vh-65px)] flex-col p-8 overflow-y-auto">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" />
            System & Worker Logs
          </h1>
          <p className="text-muted-foreground text-sm">
            Live structured logs from the Playwright extraction workers, API routes, and Prisma.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearLogs}
            className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-card shadow-sm flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <p className="text-sm text-muted-foreground animate-pulse">Loading logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <Terminal className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">No log entries found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Events will stream here automatically when tasks or operations run.
            </p>
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-card border-b border-border z-10">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground uppercase tracking-wider w-28">
                    Time
                  </th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground uppercase tracking-wider w-20">
                    Level
                  </th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground uppercase tracking-wider w-32">
                    Module
                  </th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground uppercase tracking-wider">
                    Data / Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {filteredLogs.map((log, index) => (
                  <LogEntryRow key={`${log.timestamp}-${index}`} log={log} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
