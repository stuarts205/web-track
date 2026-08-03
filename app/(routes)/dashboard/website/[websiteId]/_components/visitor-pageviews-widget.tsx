"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveUserType, VisitorPageviewType } from "@/configs/type";
import axios from "axios";
import React, { useState } from "react";

type VisitorDetailType = LiveUserType & {
  totalActiveTime: number;
  isLive: boolean;
};

interface VisitorPageviewsWidgetProps {
  visitorPageviews: VisitorPageviewType[] | undefined;
  loading: boolean;
  websiteId: string;
}

export const VisitorPageviewsWidget = ({
  visitorPageviews,
  loading,
  websiteId,
}: VisitorPageviewsWidgetProps) => {
  const [expandedVisitorId, setExpandedVisitorId] = useState<string | null>(
    null,
  );
  const [visitorDetail, setVisitorDetail] = useState<VisitorDetailType | null>(
    null,
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0s";

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };

  const normalizedCountryCode = visitorDetail?.countryCode
    ?.trim()
    .toUpperCase();
  const countryFlagUrl = normalizedCountryCode
    ? `https://flagsapi.com/${normalizedCountryCode}/flat/64.png`
    : null;

  const handleVisitorClick = async (visitorId: string) => {
    if (expandedVisitorId === visitorId) {
      setExpandedVisitorId(null);
      setVisitorDetail(null);
      return;
    }

    setExpandedVisitorId(visitorId);
    setDetailsLoading(true);

    try {
      const response = await axios.get(
        `/api/live-user?websiteId=${encodeURIComponent(websiteId)}&visitorId=${encodeURIComponent(visitorId)}`,
      );
      setVisitorDetail(response.data ?? null);
    } catch {
      setVisitorDetail(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const detailItems = visitorDetail
    ? [
        {
          label: "status",
          value: visitorDetail.isLive ? "Live now" : "Offline",
        },
        {
          label: "total_time_on_website",
          value: formatDuration(Number(visitorDetail.totalActiveTime || 0)),
        },
        {
          label: "last_seen",
          value: visitorDetail.last_seen
            ? new Date(Number(visitorDetail.last_seen)).toLocaleString()
            : "-",
        },
        { label: "city", value: visitorDetail.city || "-" },
        { label: "region", value: visitorDetail.region || "-" },
        {
          label: "country",
          value: (
            <div className="flex items-center gap-2">
              {countryFlagUrl ? (
                <img
                  src={countryFlagUrl}
                  alt={`${visitorDetail.country || "Country"} flag`}
                  width={20}
                  height={14}
                  className="rounded-sm border"
                />
              ) : null}
              <span>{visitorDetail.country || "-"}</span>
            </div>
          ),
        },
        { label: "countryCode", value: visitorDetail.countryCode || "-" },
        { label: "device", value: visitorDetail.device || "-" },
        { label: "os", value: visitorDetail.os || "-" },
        { label: "browser", value: visitorDetail.browser || "-" },
      ]
    : [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pageviews by Visitor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Loading visitor pageviews...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!visitorPageviews || visitorPageviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pageviews by Visitor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No visitor pageviews tracked yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pageviews by Visitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visitorPageviews.slice(0, 15).map((item) => {
          const isActive = expandedVisitorId === item.visitorId;

          return (
            <button
              type="button"
              key={item.visitorId}
              onClick={() => handleVisitorClick(item.visitorId)}
              className={`flex items-center justify-between gap-4 w-full rounded-md border p-3 transition-colors hover:bg-muted/50 ${
                isActive ? "bg-muted" : ""
              }`}
              title={`Show details for ${item.visitorId}`}
            >
              <p
                className="min-w-0 truncate text-sm font-medium"
                title={item.visitorId}
              >
                {item.visitorId}
              </p>
              <div className="shrink-0 text-right">
                <p className="text-lg font-semibold">{item.pageviews}</p>
                <p className="text-xs text-muted-foreground">pageviews</p>
              </div>
            </button>
          );
        })}
        {expandedVisitorId ? (
          <div className="rounded-md border p-3">
            <p className="mb-3 text-sm font-semibold">
              Details for Visitor ID {expandedVisitorId}
            </p>
            {detailsLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading details...
              </p>
            ) : visitorDetail ? (
              <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                {detailItems.map((item) => (
                  <div key={item.label} className="rounded-sm bg-muted/40 p-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                    <div className="break-all font-medium">{item.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No live_user record found for this visitor.
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
