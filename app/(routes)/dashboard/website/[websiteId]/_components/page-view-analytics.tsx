import { Card, CardContent } from "@/components/ui/card";
import { LiveUserType, WebsiteInfoType } from "@/configs/type";
import React from "react";
import { LabelCountItem } from "./label-count-item";
import { Separator } from "@/components/ui/separator";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PageViewAnalyticsProps {
  websiteInfo: WebsiteInfoType | undefined | null;
  loading: boolean;
  analyticsType: string;
  liveUser: number | undefined;
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const PageViewAnalytics = ({
  websiteInfo,
  loading,
  analyticsType,
  liveUser,
}: PageViewAnalyticsProps) => {
  const webAnalytics = websiteInfo?.analytics;
  return (
    <div className="mt-7">
      <Card>
        <CardContent className="p-5 flex items-center justify-between gap-6">
          <LabelCountItem
            label="Visitors"
            value={webAnalytics?.totalVisitors}
          />
          <Separator orientation="vertical" className="h-12" />
          <LabelCountItem
            label="Total PageViews"
            value={webAnalytics?.totalSessions}
          />
          <Separator orientation="vertical" className="h-12" />
          <LabelCountItem
            label="Total Active Time"
            value={
              (Number(webAnalytics?.totalActiveTime) / 60).toFixed(1) + "min"
            }
          />
          <Separator orientation="vertical" className="h-12" />
          <LabelCountItem
            label="Average Active Time"
            value={
              (Number(webAnalytics?.avgActiveTime) / 60).toFixed(1) + "min"
            }
          />
          <Separator orientation="vertical" className="h-12" />
          <LabelCountItem label="Live Users" value={liveUser ?? 0} />
        </CardContent>
        <CardContent className="p-5 mt-5">
          <ChartContainer config={chartConfig} className='h-96 w-full'>
            <AreaChart
              accessibilityLayer
              data={analyticsType === "hourly" ? webAnalytics?.hourlyVisitors : webAnalytics?.dailyVisitors}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={analyticsType === "hourly" ? "hourLabel" : "dateLabel"}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="count"
                type="monotone"
                fill="var(--color-primary)"
                fillOpacity={0.4}
                stroke="var(--color-primary)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
