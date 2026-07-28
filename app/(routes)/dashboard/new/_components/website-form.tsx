"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { Globe, Loader2Icon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const northAmerica = [
  { label: "Eastern Standard Time", value: "est" },
  { label: "Central Standard Time", value: "cst" },
  { label: "Mountain Standard Time", value: "mst" },
  { label: "Pacific Standard Time", value: "pst" },
  { label: "Alaska Standard Time", value: "akst" },
  { label: "Hawaii Standard Time", value: "hst" },
];
const europeAfrica = [
  { label: "Greenwich Mean Time", value: "gmt" },
  { label: "Central European Time", value: "cet" },
  { label: "Eastern European Time", value: "eet" },
  { label: "Western European Summer Time", value: "west" },
  { label: "Central Africa Time", value: "cat" },
  { label: "East Africa Time", value: "eat" },
];
const asia = [
  { label: "Moscow Time", value: "msk" },
  { label: "India Standard Time", value: "ist" },
  { label: "China Standard Time", value: "cst_china" },
  { label: "Japan Standard Time", value: "jst" },
  { label: "Korea Standard Time", value: "kst" },
  { label: "Indonesia Central Standard Time", value: "ist_indonesia" },
];
const australiaPacific = [
  { label: "Australian Western Standard Time", value: "awst" },
  { label: "Australian Central Standard Time", value: "acst" },
  { label: "Australian Eastern Standard Time", value: "aest" },
  { label: "New Zealand Standard Time", value: "nzst" },
  { label: "Fiji Time", value: "fjt" },
];
const southAmerica = [
  { label: "Argentina Time", value: "art" },
  { label: "Bolivia Time", value: "bot" },
  { label: "Brasilia Time", value: "brt" },
  { label: "Chile Standard Time", value: "clt" },
];

function WebsiteForm() {
  const [enableLocalhostTracking, setEnableLocalhostTracking] = useState(false);
  const [domain, setDomain] = useState("");
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const websiteId = crypto.randomUUID();

  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    console.log({
      websiteId,
      domain,
      timezone,
      enableLocalhostTracking,
    });
    setLoading(true);

    const result = await axios.post("/api/website", {
      websiteId,
      domain,
      timezone,
      enableLocalhostTracking,
    });

    console.log(result.data);
    if (result.data.data) {
      router.push(
        `/dashboard/new?step=script&websiteId=${result?.data?.data?.websiteId}&domain=${result?.data?.data?.domain}`,
      );
    } else if (!result?.data?.message) {
      router.push(
        `/dashboard/new?step=script&websiteId=${websiteId}&domain=${domain}`,
      );
    }
    else {
      toast.error(result?.data?.message || "An error occurred");
    }

    setLoading(false);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Add as new website</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <form className="mt-3" onSubmit={(e) => onFormSubmit(e)}>
            <label className="text-sm">Domain</label>
            <InputGroup className="mt-2">
              <InputGroupInput
                type="text"
                placeholder="www.example.com"
                required
                onChange={(e) => setDomain("https://" + e.target.value)}
              />
              <InputGroupAddon align="inline-start">
                <Globe className="text-muted-foreground" />
                <span> https://</span>
              </InputGroupAddon>
            </InputGroup>
            <div className="mt-3">
              <label className="text-sm">Timezone</label>
              <div className="mt-2">
                <Select required onValueChange={(value) => setTimezone(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectGroup>
                      <SelectLabel>North America</SelectLabel>
                      {northAmerica.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Europe & Africa</SelectLabel>
                      {europeAfrica.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Asia</SelectLabel>
                      {asia.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Australia & Pacific</SelectLabel>
                      {australiaPacific.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>South America</SelectLabel>
                      {southAmerica.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-5 w-full">
                <Checkbox
                  onCheckedChange={(e) =>
                    setEnableLocalhostTracking(e as boolean)
                  }
                />{" "}
                <span className="text-sm font-bold text-muted-foreground">
                  Enable localhost tracking for development
                </span>
              </div>
              <Button className="mt-5 w-full" disabled={loading}>
                {loading ? <Loader2Icon className="animate-spin" /> : <Plus />}{" "}
                Add Website
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default WebsiteForm;
