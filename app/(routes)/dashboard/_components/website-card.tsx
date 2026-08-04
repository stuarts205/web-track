import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { WebsiteInfoType, WebsiteType } from "@/configs/type";
import { Globe } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

interface WebsiteCardProps {
  websiteinfo: WebsiteInfoType;
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const WebsiteCard = ({ websiteinfo }: WebsiteCardProps) => {
  const hourlyData = websiteinfo?.analytics?.hourlyVisitors;
  const chartData =
    hourlyData.length == 1
      ? [
          {
            ...hourlyData[0],
            hour:
              Number(hourlyData[0]?.hour) - 1 >= 0
                ? Number(hourlyData[0]?.hour) - 1
                : 0,
            count: 0,
            hourLabel: `${Number(hourlyData[0]?.hour) - 1} AM/PM`,
          },
          hourlyData[0],
        ]
      : hourlyData;

  return (
    <Link
      href={`/dashboard/website/${websiteinfo?.website?.websiteId}`}
      className="block"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex min-w-0 items-center gap-2">
              <Globe className="h-8 w-8 p-2 rounded-md bg-primary text-white" />
              <h2 className="truncate text-base font-bold sm:text-lg">
                {websiteinfo?.website?.domain
                  .replace("https://", "")
                  .replace("http://", "")}
              </h2>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="max-h-20 w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 10,
                bottom: 10,
              }}
            >
              <Area
                dataKey="count"
                type="natural"
                fill="var(--color-primary)"
                fillOpacity={0}
                stroke="var(--color-primary)"
                strokeWidth={4}
              />
            </AreaChart>
          </ChartContainer>
          <h2 className="text-sm mt-2">
            <strong>{websiteinfo?.analytics?.totalVisitors}</strong> visitors
          </h2>
        </CardContent>
      </Card>
    </Link>
  );
};

export default WebsiteCard;
