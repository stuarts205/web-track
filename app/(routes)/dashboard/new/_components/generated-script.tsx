"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function GeneratedScript() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const websiteId = searchParams.get("websiteId");
  const domain = searchParams.get("domain");
  const old = searchParams.get("old");

  const script = `<script
    defer
    data-website-id="${websiteId}"
    data-domain="${domain}"
    src="https://web-track-seven.vercel.app/analytics.js">
    </script>`;

  const copyScript = async () => {
    await navigator.clipboard.writeText(script);
    toast.success("Script copied successfully");
  };

  return (
    <div className="flex items-center justify-center mt-10">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            {old ? "Website Already Exists" : "Website Added Successfully"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mb-5">
            <p className="text-sm text-muted-foreground">
              Add this script inside the <code>{`<head>`}</code> of your
              website.
            </p>
          </div>

          <div className="bg-black rounded-xl p-5 overflow-auto ">
            <pre className="text-sm text-green-400 whitespace-pre-wrap w-full">
              {script}
            </pre>
          </div>
          <div className="flex justify-between">
            <Button onClick={copyScript} className="mt-5 cursor-pointer">
              <Copy />
              Copy Script
            </Button>
            <Button
              onClick={() => {
                router.push("/dashboard");
              }}
              className="mt-5 cursor-pointer"
            >
              <CheckCircle />
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GeneratedScript;
