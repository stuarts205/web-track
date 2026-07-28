import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { WebsiteType } from "@/configs/type";
import { Globe } from "lucide-react";
import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

interface WebsiteCardProps {
  website: WebsiteType;
}

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const WebsiteCard = ({ website }: WebsiteCardProps) => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex gap-2 items-center">
              <Globe className="h-8 w-8 p-2 rounded-md bg-primary text-white" />
              <h2 className="font-bold text-lg">
                {website?.domain.replace("https://", "").replace("http://", "")}
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
              }}
            >
              <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-primary)"
                fillOpacity={0.4}
                stroke="var(--color-primary)"
              />
            </AreaChart>
          </ChartContainer>
          <h2 className='text-sm mt-2'><strong>24 </strong>visitors</h2>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteCard;
