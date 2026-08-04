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

type ClickedEventType = {
  eventType: string;
  elementType: string;
  label: string | null;
  targetUrl: string | null;
  clickedAt: string | null;
};

type VisitorDetailType = LiveUserType & {
  totalActiveTime: number;
  isLive: boolean;
  swipeStats: {
    total: number;
    next: number;
    previous: number;
  };
  clickedImages: ImageClickType[];
  clickedEvents: ClickedEventType[];
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
        {
          label: "image_swipes_total",
          value: visitorDetail.swipeStats?.total ?? 0,
        },
        {
          label: "image_swipes_next",
          value: visitorDetail.swipeStats?.next ?? 0,
        },
        {
          label: "image_swipes_previous",
          value: visitorDetail.swipeStats?.previous ?? 0,
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
      <CardContent className="space-y-3 p-4 sm:p-6">
        {visitorPageviews.slice(0, 15).map((item) => {
          const isActive = expandedVisitorId === item.visitorId;
          const isLive = liveVisitorSet.has(item.visitorId);

          return (
            <button
              type="button"
              key={item.visitorId}
              onClick={() => handleVisitorClick(item.visitorId)}
              className={`flex w-full flex-col items-start justify-between gap-3 rounded-md border p-3 text-left transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:text-left ${
                isActive ? "bg-muted" : ""
              } ${
                isLive
                  ? "border-emerald-400/70 bg-emerald-50/60 dark:bg-emerald-950/30"
                  : ""
              }`}
              title={`Show details for ${item.visitorId}`}
            >
              <div className="min-w-0 w-full sm:w-auto">
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
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-lg font-semibold">{item.pageviews}</p>
                <p className="text-xs text-muted-foreground">pageviews</p>
                <span className="mt-1 inline-block rounded-full border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  swipes {item.swipeStats?.total ?? 0} (
                  {item.swipeStats?.next ?? 0}/{item.swipeStats?.previous ?? 0})
                </span>
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
                    Swipe summary
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-sm border bg-background p-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Total
                      </p>
                      <p className="text-sm font-semibold">
                        {visitorDetail.swipeStats?.total ?? 0}
                      </p>
                    </div>
                    <div className="rounded-sm border bg-background p-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Next
                      </p>
                      <p className="text-sm font-semibold">
                        {visitorDetail.swipeStats?.next ?? 0}
                      </p>
                    </div>
                    <div className="rounded-sm border bg-background p-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Previous
                      </p>
                      <p className="text-sm font-semibold">
                        {visitorDetail.swipeStats?.previous ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-sm bg-muted/40 p-2">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Clicked images
                  </p>
                  {visitorDetail.clickedImages?.length ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                      {visitorDetail.clickedImages.map((image, index) => {
                        const clickedAtText = image.clickedAt
                          ? new Date(
                              Number(image.clickedAt) * 1000,
                            ).toLocaleString()
                          : "Unknown time";

                        return (
                          <div
                            key={`${image.imageUrl || "no-url"}-${image.clickedAt || "no-time"}-${index}`}
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
                <div className="rounded-sm bg-muted/40 p-2">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Clicked events
                  </p>
                  {visitorDetail.clickedEvents?.length ? (
                    <div className="space-y-2">
                      {visitorDetail.clickedEvents.map((event, index) => {
                        const clickedAtText = event.clickedAt
                          ? new Date(
                              Number(event.clickedAt) * 1000,
                            ).toLocaleString()
                          : "Unknown time";

                        const displayLabel =
                          event.label?.trim() ||
                          event.targetUrl?.trim() ||
                          "Untitled Event";

                        return (
                          <div
                            key={`${event.elementType}-${event.clickedAt || "no-time"}-${index}`}
                            className="rounded-sm border bg-background p-2"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                                {event.elementType}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {event.eventType}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs font-medium">
                              {displayLabel}
                            </p>
                            <p
                              className="truncate text-[11px] text-muted-foreground"
                              title={event.targetUrl || ""}
                            >
                              {event.targetUrl || "No target URL"}
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
                      No click events found for this visitor.
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
