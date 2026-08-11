"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

type LoginEventRecord = {
  id: number;
  websiteId: string;
  eventName: string;
  userId: string | null;
  source: string;
  sessionId: string | null;
  createdAt: number;
};

interface LoginEventsWidgetProps {
  websiteId: string;
}

export const LoginEventsWidget = ({ websiteId }: LoginEventsWidgetProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<LoginEventRecord[]>([]);

  const fetchLoginEvents = useCallback(async () => {
    if (!websiteId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await axios.get(
        `/api/events?websiteId=${websiteId}&eventName=user_login&limit=12`,
      );
      setEvents(response.data?.data ?? []);
    } catch {
      setError("Unable to load login events.");
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    setLoading(true);
    fetchLoginEvents();

    const intervalId = setInterval(fetchLoginEvents, 15000);
    return () => clearInterval(intervalId);
  }, [fetchLoginEvents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Login Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading login events...
          </p>
        ) : null}

        {!loading && error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        {!loading && !error ? (
          <p className="text-xs text-muted-foreground">
            Total in view: {events.length}
          </p>
        ) : null}

        {!loading && !error && events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No login events tracked yet.
          </p>
        ) : null}

        {!loading && !error
          ? events.map((event) => (
              <div key={event.id} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">
                    {event.userId || "anonymous user"}
                  </p>
                  <Badge variant="outline">{event.source}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>event: {event.eventName}</span>
                  <span>session: {event.sessionId || "n/a"}</span>
                  <span>
                    {new Date(Number(event.createdAt) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          : null}
      </CardContent>
    </Card>
  );
};
