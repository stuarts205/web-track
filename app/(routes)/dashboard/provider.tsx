"use client";
import AppHeader from "@/app/_components/AppHeader";
import React from "react";

const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <AppHeader />
      <div className="px-3 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
        {children}
      </div>
    </div>
  );
};

export default DashboardProvider;
