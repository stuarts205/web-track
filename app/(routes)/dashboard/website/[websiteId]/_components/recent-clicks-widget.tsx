"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

type ClickEventRecord = {
  id: number;
  websiteId: string;
  visitorId: string | null;
  domain: string;
  pageUrl: string | null;
  eventType: string;
  elementType: string;
  label: string | null;
  targetUrl: string | null;
  elementId: string | null;
  elementClass: string | null;
  createdAt: number;
};

interface RecentClicksWidgetProps {
  websiteId: string;
}

export const RecentClicksWidget = ({ websiteId }: RecentClicksWidgetProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clicks, setClicks] = useState<ClickEventRecord[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [elementTypeFilter, setElementTypeFilter] = useState("all");
  const [timeRangeFilter, setTimeRangeFilter] = useState("24h");

  const resolveFromUnix = (range: string) => {
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (range === "24h") return nowSeconds - 24 * 60 * 60;
    if (range === "7d") return nowSeconds - 7 * 24 * 60 * 60;
    if (range === "30d") return nowSeconds - 30 * 24 * 60 * 60;
    return undefined;
  };

  const fetchClicks = useCallback(async () => {
    if (!websiteId) {
      setClicks([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const params = new URLSearchParams({
        websiteId,
        limit: "15",
      });

      if (eventTypeFilter !== "all") {
        params.set("eventType", eventTypeFilter);
      }

      if (elementTypeFilter !== "all") {
        params.set("elementType", elementTypeFilter);
      }

      const fromUnix = resolveFromUnix(timeRangeFilter);
      if (typeof fromUnix === "number") {
        params.set("from", fromUnix.toString());
        params.set("to", Math.floor(Date.now() / 1000).toString());
      }

      const response = await axios.get(`/api/clicks?${params.toString()}`);
      setClicks(response.data?.data ?? []);
    } catch {
      setError("Unable to load click events.");
    } finally {
      setLoading(false);
    }
  }, [websiteId, eventTypeFilter, elementTypeFilter, timeRangeFilter]);

  useEffect(() => {
    setLoading(true);
    fetchClicks();

    const intervalId = setInterval(fetchClicks, 15000);
    return () => clearInterval(intervalId);
  }, [fetchClicks]);

  const formatEventLabel = (click: ClickEventRecord) => {
    if (click.label?.trim()) return click.label;
    if (click.targetUrl?.trim()) return click.targetUrl;
    if (click.pageUrl?.trim()) return click.pageUrl;
    return "Untitled Event";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Click Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="space-y-1 text-xs text-muted-foreground">
            Event Type
            <select
              className="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground"
              value={eventTypeFilter}
              onChange={(e) => {
                setLoading(true);
                setEventTypeFilter(e.target.value);
              }}
            >
              <option value="all">All events</option>
              <option value="click">Links</option>
              <option value="image_click">Images</option>
              <option value="menu_click">Menus</option>
              <option value="button_click">Buttons</option>
            </select>
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            Element Type
            <select
              className="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground"
              value={elementTypeFilter}
              onChange={(e) => {
                setLoading(true);
                setElementTypeFilter(e.target.value);
              }}
            >
              <option value="all">All elements</option>
              <option value="link">Link</option>
              <option value="image">Image</option>
              <option value="menu">Menu</option>
              <option value="button">Button</option>
            </select>
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            Time Range
            <select
              className="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground"
              value={timeRangeFilter}
              onChange={(e) => {
                setLoading(true);
                setTimeRangeFilter(e.target.value);
              }}
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading click events...
          </p>
        ) : null}

        {!loading && error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        {!loading && !error && clicks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No click events tracked yet.
          </p>
        ) : null}

        {!loading && !error
          ? clicks.map((click) => (
              <div key={click.id} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="truncate text-sm font-medium"
                    title={formatEventLabel(click)}
                  >
                    {formatEventLabel(click)}
                  </p>
                  <Badge variant="outline">{click.elementType}</Badge>
                </div>
                <p
                  className="truncate text-xs text-muted-foreground"
                  title={click.targetUrl || ""}
                >
                  {click.targetUrl || "No target URL"}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>event: {click.eventType}</span>
                  <span>visitor: {click.visitorId || "anonymous"}</span>
                  <span>
                    {new Date(Number(click.createdAt) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          : null}
      </CardContent>
    </Card>
  );
};
