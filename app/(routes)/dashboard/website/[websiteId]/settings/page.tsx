"use client";
import { Button } from "@/components/ui/button";
import { WebsiteType } from "@/configs/type";
import axios from "axios";
import { ArrowLeft, CheckCircle, Copy, Loader, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WebsiteSettings = () => {
  const { websiteId } = useParams();
  const [websiteDetail, setWebsiteDetail] = useState<WebsiteType>();
  const [websiteDomain, setWebsiteDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    getWebsiteDetail();
  }, []);

  const getWebsiteDetail = async () => {
    const result = await axios.get(
      `/api/website?websiteId=${websiteId}&websiteOnly=true`,
    );
    setWebsiteDetail(result.data);
    setWebsiteDomain(result?.data?.domain);
  };

  const script = `<script
      defer
      data-website-id="${websiteId}"
      data-domain="${websiteDetail?.domain}"
      src="http://localhost:3000/analytics.js">
</script>`;

  const copyScript = async () => {
    await navigator.clipboard.writeText(script);
    toast.success("Script copied successfully");
  };

  const onDeleteWebsite = async () => {
    setLoading(true);
    const result = await axios.delete("/api/website", {
      data: {
        websiteId,
      },
    });

    toast.success("Website deleted successfully");
    setLoading(false);
    router.replace("/dashboard");
  };

  return (
    <div className="w-full mt-10 mb-20">
      <Button>
        <ArrowLeft /> Back
      </Button>
      <h2 className="font-bold text-2xl mt-4">
        Settings for{" "}
        {websiteDetail?.domain.replace("http://", "").replace("https://", "")}
      </h2>
      <Tabs defaultValue="general" className="w-[800px] mt-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Script</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="mt-4">
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
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Domain</CardTitle>
              <CardDescription>
                You main website domain for analytics tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="website.com"
                value={websiteDomain}
                onChange={(e) => setWebsiteDomain(e.target.value)}
              />
              <div className="flex justify-between mt-2">
                <h2>Your public WEBTRACK ID is: {websiteId}</h2>
                <Button>Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="other">
          <Card>
            <CardHeader>
              <CardTitle>Danger</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <h2>Do you want to delete this website from web track?</h2>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="text-white" variant="destructive">
                    <Trash /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      className="text-white"
                      variant="destructive"
                      onClick={() => onDeleteWebsite()}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Continue to delete"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteSettings;
