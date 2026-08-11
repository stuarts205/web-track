"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

type TrackerRuleRecord = {
  id: number;
  websiteId: string;
  eventName: string;
  enabled: boolean;
  source: string;
  filtersJson: string | null;
  createdBy: string | null;
  createdAt: number;
};

interface TrackerRulesWidgetProps {
  websiteId: string;
}

export const TrackerRulesWidget = ({ websiteId }: TrackerRulesWidgetProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState<TrackerRuleRecord[]>([]);
  const [eventName, setEventName] = useState("user_login");
  const [source, setSource] = useState("webhook");

  const loadRules = useCallback(async () => {
    if (!websiteId) {
      setRules([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await axios.get(
        `/api/tracker-rules?websiteId=${websiteId}`,
      );
      setRules(response.data?.data ?? []);
    } catch {
      setError("Unable to load tracker rules.");
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    setLoading(true);
    loadRules();
  }, [loadRules]);

  const createRule = async () => {
    if (!eventName.trim()) return;

    try {
      setSaving(true);
      setError(null);

      await axios.post("/api/tracker-rules", {
        websiteId,
        eventName: eventName.trim(),
        source,
        enabled: true,
      });

      await loadRules();
      setEventName("user_login");
    } catch {
      setError("Unable to create tracker rule.");
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = async (id: number, enabled: boolean) => {
    try {
      await axios.patch("/api/tracker-rules", { id, enabled });
      setRules((prev) =>
        prev.map((rule) => (rule.id === id ? { ...rule, enabled } : rule)),
      );
    } catch {
      setError("Unable to update tracker rule.");
    }
  };

  return (
    <Card className="h-fit self-start">
      <CardHeader>
        <CardTitle>Tracker Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_150px_auto]">
          <Input
            placeholder="Event name (example: user_login)"
            value={""}
            onChange={(e) => setEventName(e.target.value)}
          />
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="webhook">webhook</option>
            <option value="manual">manual</option>
            <option value="sdk">sdk</option>
            <option value="server">server</option>
          </select>
          <Button onClick={createRule} disabled={saving || !websiteId}>
            {saving ? "Saving..." : "Add Rule"}
          </Button>
        </div>

        {!loading && !error && rules.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Total rules: {rules.length}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading rules...</p>
        ) : null}

        {!loading && error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        {!loading && !error && rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No rules yet. Add a rule to start tracking events.
          </p>
        ) : null}

        {!loading && !error
          ? rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{rule.eventName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{rule.source}</Badge>
                    <span>
                      created {new Date(rule.createdAt * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {rule.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                  />
                </div>
              </div>
            ))
          : null}
      </CardContent>
    </Card>
  );
};
