"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import {
  Calendar1Icon,
  CalendarIcon,
  ChevronDownIcon,
  RefreshCcw,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import Link from "next/link";

interface FormInputProps {
  websiteList: WebsiteType[];
  setFormData: any;
  setReloadData: any;
}

export const FormInput = ({ websiteList, setFormData, setReloadData }: FormInputProps) => {
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
    })
  }, [date, analysicType]);

  return (
    <div className="flex gap-5 items-center justify-between">
      <div className="flex gap-5 items-center">
        <Select value={(websiteId as string) || ""} onValueChange={(value) => router.push(`/dashboard/website/${value}`)}>
          <SelectTrigger className="w-60">
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
              className={`data-[empty=true]:text-muted-foreground justify-start text-left font-normal
                ${date?.to ? "w-[380px]" : "w-[220px]"}`}
            >
              <CalendarIcon />
              {date?.from ? (
                date?.to ? (
                  <>
                    {format(date.from, "PPP")} - {format(date.to, "PPP")}
                  </>
                ) : (
                  <>{format(date.from, "PPP")}</>
                )
              ) : (
                <span className="text-muted-foreground">Select a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex justify-between items-center my-3 px-2">
              <Button variant="outline" onClick={handleTodayClick}>
                Today
              </Button>
              <Button variant="outline" onClick={handleResetClick}>
                Reset
              </Button>
            </div>
            <Calendar
              className="w-[280px]"
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
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select analysis type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setReloadData(true)}>
          <RefreshCcw />
        </Button>
      </div>
      <Link href={`/dashboard/website/${websiteId}/settings`}>
        <Button variant="outline" className="cursor-pointer">
          <Settings />
        </Button>
      </Link>
    </div>
  );
};
