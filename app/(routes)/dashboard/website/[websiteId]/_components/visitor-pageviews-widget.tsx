"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveUserType, VisitorPageviewType } from "@/configs/type";
import axios from "axios";
import React, { useState } from "react";

type ImageClickType = {
  imageUrl: string | null;
  imageLabel: string | null;
  clickedAt: string | null;
};

type VisitorDetailType = LiveUserType & {
  totalActiveTime: number;
  isLive: boolean;
  clickedImages: ImageClickType[];
};

interface VisitorPageviewsWidgetProps {
  visitorPageviews: VisitorPageviewType[] | undefined;
  loading: boolean;
  websiteId: string;
  liveUsers?: LiveUserType[] | null;
}

export const VisitorPageviewsWidget = ({
  visitorPageviews,
  loading,
  websiteId,
  liveUsers,
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
  const liveVisitorSet = new Set(
    (liveUsers ?? [])
      .map((user) => user.visitorId)
      .filter((id): id is string => Boolean(id)),
  );

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
          const isLive = liveVisitorSet.has(item.visitorId);

          return (
            <button
              type="button"
              key={item.visitorId}
              onClick={() => handleVisitorClick(item.visitorId)}
              className={`flex w-full items-center justify-between gap-4 rounded-md border p-3 transition-colors hover:bg-muted/50 ${
                isActive ? "bg-muted" : ""
              } ${
                isLive
                  ? "border-emerald-400/70 bg-emerald-50/60 dark:bg-emerald-950/30"
                  : ""
              }`}
              title={`Show details for ${item.visitorId}`}
            >
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-medium"
                  title={item.visitorId}
                >
                  {item.visitorId}
                </p>
                {isLive ? (
                  <span className="inline-block rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Live
                  </span>
                ) : null}
              </div>
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
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                  {detailItems.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-sm bg-muted/40 p-2"
                    >
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <div className="break-all font-medium">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-sm bg-muted/40 p-2">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Clicked images
                  </p>
                  {visitorDetail.clickedImages?.length ? (
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {visitorDetail.clickedImages.map((image, index) => {
                        const clickedAtText = image.clickedAt
                          ? new Date(
                              Number(image.clickedAt) * 1000,
                            ).toLocaleString()
                          : "Unknown time";

                        return (
                          <div
                            className="block overflow-hidden rounded-sm border bg-background p-2"
                          >
                            {image.imageUrl ? (
                              <img
                                src={image.imageUrl}
                                alt={image.imageLabel || "Clicked image"}
                                className="h-24 w-full rounded-sm object-cover"
                              />
                            ) : (
                              <div className="flex h-24 w-full items-center justify-center rounded-sm bg-muted text-xs text-muted-foreground">
                                No image URL
                              </div>
                            )}
                            <p className="mt-2 truncate text-xs font-medium">
                              {image.imageLabel || "Untitled Image"}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {clickedAtText}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No images clicked for this visitor.
                    </p>
                  )}
                </div>
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
