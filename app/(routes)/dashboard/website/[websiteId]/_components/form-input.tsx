"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WebsiteType } from "@/configs/type";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, RefreshCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import Link from "next/link";

interface FormInputProps {
  websiteList: WebsiteType[];
  setFormData: any;
  setReloadData: any;
}

export const FormInput = ({
  websiteList,
  setFormData,
  setReloadData,
}: FormInputProps) => {
  const { websiteId } = useParams();
  const today = new Date();
  const [date, setDate] = useState<DateRange>({
    from: today,
  });
  const router = useRouter();
  const [analysicType, setAnalysicType] = useState<string>("hourly");

  const handleDateChange = (selected?: DateRange) => {
    if (!selected?.from) return;
    if (selected?.from && !selected?.to) {
      setDate({ from: selected.from });
      return;
    }
    setDate({ from: selected.from, to: selected.to });
  };

  const handleTodayClick = () => {
    setDate({ from: today });
  };

  const handleResetClick = () => {
    setDate({ from: today });
  };

  useEffect(() => {
    setFormData({
      analysicType: analysicType,
      fromDate: date?.from ?? today,
      toDate: date?.to ?? today,
    });
  }, [date, analysicType]);

  return (
    <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between landscape:gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 landscape:flex-row landscape:flex-wrap landscape:items-center">
        <Select
          value={(websiteId as string) || ""}
          onValueChange={(value) => router.push(`/dashboard/website/${value}`)}
        >
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue placeholder="Select a website" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {websiteList.map((website) => (
                <SelectItem key={website.id} value={website.websiteId}>
                  {website.domain.replace("https://", "")}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              data-empty={!date}
              className={`w-full justify-start text-left text-xs font-normal data-[empty=true]:text-muted-foreground sm:w-auto sm:text-sm
                ${date?.to ? "sm:w-[380px]" : "sm:w-[220px]"}`}
            >
              <CalendarIcon className="h-4 w-4" />
              {date?.from ? (
                date?.to ? (
                  <>
                    <span className="sm:hidden landscape:inline">
                      {format(date.from, "MMM d")} - {format(date.to, "MMM d")}
                    </span>
                    <span className="hidden sm:inline landscape:hidden">
                      {format(date.from, "PPP")} - {format(date.to, "PPP")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden landscape:inline">
                      {format(date.from, "MMM d")}
                    </span>
                    <span className="hidden sm:inline landscape:hidden">
                      {format(date.from, "PPP")}
                    </span>
                  </>
                )
              ) : (
                <span className="text-muted-foreground">Select a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[min(96vw,22rem)] p-0 sm:w-auto"
            align="start"
          >
            <div className="flex justify-between items-center my-3 px-2">
              <Button variant="outline" size="sm" onClick={handleTodayClick}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetClick}>
                Reset
              </Button>
            </div>
            <Calendar
              className="w-full p-2 sm:w-[280px]"
              mode="range"
              onSelect={handleDateChange}
              selected={date}
            />
          </PopoverContent>
        </Popover>
        <Select
          value={analysicType}
          onValueChange={(value) => setAnalysicType(value)}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Select analysis type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="w-full sm:w-auto landscape:w-auto"
          onClick={() => setReloadData(true)}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
      <Link
        href={`/dashboard/website/${websiteId}/settings`}
        className="w-full lg:w-auto landscape:w-auto"
      >
        <Button
          variant="outline"
          className="w-full cursor-pointer lg:w-auto landscape:w-auto"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
};
