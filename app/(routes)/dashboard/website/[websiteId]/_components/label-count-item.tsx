import { AnalyticsType } from "@/configs/type";
import React from "react";

interface LabelCountItemProps {
    label: string;
    value: undefined | null | number | string;
}

export const LabelCountItem = ({ label, value }: LabelCountItemProps) => {
  return (
    <div>
      <h2>{label}</h2>
      <h2 className="font-bold text-4xl">{value}</h2>
    </div>
  );
};
