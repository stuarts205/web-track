import { AnalyticsType } from "@/configs/type";
import React from "react";

interface LabelCountItemProps {
  label: string;
  value: undefined | null | number | string;
}

export const LabelCountItem = ({ label, value }: LabelCountItemProps) => {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-1 sm:gap-2">
      <div className="flex min-h-8 items-end justify-center text-center text-[11px] leading-tight text-muted-foreground sm:min-h-10 sm:text-sm">
        {label}
      </div>
      <div className="wrap-break-word text-xl font-bold sm:text-2xl lg:text-4xl">
        {value}
      </div>
    </div>
  );
};
