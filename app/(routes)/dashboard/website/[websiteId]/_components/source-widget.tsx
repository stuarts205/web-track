import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsType, IMAGE_URL_FOR_DOMAINS } from "@/configs/type";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SourceWidgetProps {
  websiteAnalytics: AnalyticsType | undefined;
  loading: boolean;
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

export const SourceWidget = ({
  websiteAnalytics,
  loading,
}: SourceWidgetProps) => {
  const barLabelWithImage = (props: any) => {
    const { x, y, height, value } = props;

    const imageUrl = IMAGE_URL_FOR_DOMAINS?.replace("<domain>", value);

    return (
      <g transform={`translate(${x + 8}, ${y + height / 2 - 8})`}>
        <image href={imageUrl} width={16} height={16} />
        <text x={20} y={12} fontSize={11} fill="#ffffff">
          {String(value).slice(0, 12)}
        </text>
      </g>
    );
  };

  return (
    <div>
      <Card>
        <CardContent className="p-3 sm:p-5">
          <Tabs defaultValue="source" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger
                value="source"
                className="shrink-0 text-xs sm:text-sm landscape:py-1"
              >
                Source
              </TabsTrigger>
              <TabsTrigger
                value="referral"
                className="shrink-0 text-xs sm:text-sm landscape:py-1"
              >
                Referral
              </TabsTrigger>
            </TabsList>
            <TabsContent value="source">
              <ChartContainer
                config={chartConfig}
                className="h-56 w-full sm:h-80 landscape:h-44 sm:landscape:h-56"
              >
                <BarChart
                  accessibilityLayer
                  data={websiteAnalytics?.referrals || []}
                  layout="vertical"
                  margin={{
                    right: 8,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="domainName"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <XAxis dataKey="uv" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="uv"
                    layout="vertical"
                    fill="var(--color-desktop)"
                    radius={4}
                  >
                    <LabelList
                      dataKey="domainName"
                      position="insideLeft"
                      offset={8}
                      className="fill-(--color-label)"
                      fontSize={12}
                      content={barLabelWithImage}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="referral">
              <ChartContainer
                config={chartConfig}
                className="h-56 w-full sm:h-80 landscape:h-44 sm:landscape:h-56"
              >
                <BarChart
                  accessibilityLayer
                  data={websiteAnalytics?.refParams || []}
                  layout="vertical"
                  margin={{
                    right: 8,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <XAxis dataKey="uv" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="uv"
                    layout="vertical"
                    fill="var(--color-desktop)"
                    radius={4}
                  >
                    <LabelList
                      dataKey="name"
                      position="insideLeft"
                      offset={8}
                      className="fill-(--color-label)"
                      fontSize={12}
                      content={barLabelWithImage}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
