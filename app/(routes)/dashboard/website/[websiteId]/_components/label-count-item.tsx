import { AnalyticsType } from "@/configs/type";
import React from "react";

interface LabelCountItemProps {
  label: string;
  value: undefined | null | number | string;
}

export const LabelCountItem = ({ label, value }: LabelCountItemProps) => {
  return (
    <div className="min-w-0">
      <h2 className="text-xs leading-tight text-muted-foreground sm:text-sm">
        {label}
      </h2>
      <h2 className="wrap-break-word text-xl font-bold sm:text-2xl lg:text-4xl">
        {value}
      </h2>
    </div>
  );
};
