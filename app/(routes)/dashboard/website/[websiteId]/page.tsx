"use client";
import { LiveUserType, WebsiteInfoType, WebsiteType } from "@/configs/type";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FormInput } from "./_components/form-input";
import { PageViewAnalytics } from "./_components/page-view-analytics";
import { format } from "date-fns";
import { SourceWidget } from "./_components/source-widget";
import { ClickedLinksWidget } from "./_components/clicked-links-widget";
import { VisitorPageviewsWidget } from "./_components/visitor-pageviews-widget";

function WebsiteDetail() {
  const { websiteId } = useParams();
  const activeWebsiteId = Array.isArray(websiteId) ? websiteId[0] : websiteId;
  const [websiteList, setWebsiteList] = useState<WebsiteType[]>([]);
  const [loading, setLoading] = useState(false);
  const [websiteInfo, setWebsiteInfo] = useState<WebsiteInfoType | null>(null);
  const [formData, setFormData] = useState<any>({
    analysicType: "hourly",
    fromDate: new Date(),
    toDate: new Date(),
  });
  const [liveUser, setLiveUser] = useState<LiveUserType[] | null>([]);

  useEffect(() => {
    getWebsiteList();
    getWebsiteAnalyticDetail();
  }, []);

  useEffect(() => {
    getLiveUser();

    const intervalId = setInterval(() => {
      getLiveUser();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [websiteId]);

  const getWebsiteList = async () => {
    const response = await axios.get("/api/website?websiteOnly=true");
    console.log(response.data);
    setWebsiteList(response.data);
  };

  useEffect(() => {
    getWebsiteAnalyticDetail();
  }, [formData?.fromDate, formData?.toDate]);

  const getWebsiteAnalyticDetail = async () => {
    setLoading(true);
    const fromDate = format(formData?.fromDate, "yyyy-MM-dd");
    const toDate = formData?.to
      ? format(formData?.toDate, "yyyy-MM-dd")
      : fromDate;
    const websiteResult = await axios.get(
      `/api/website?websiteId=${activeWebsiteId}&from=${fromDate}&to=${toDate}`,
    );
    console.log(websiteResult.data);
    setWebsiteInfo(websiteResult.data[0]);
    setLoading(false);
    getLiveUser();
  };

  const getLiveUser = async () => {
    const result = await axios.get(`/api/live-user?websiteId=${websiteId}`);
    setLiveUser(result?.data);
  };

  return (
    <div className="mt-10 mb-10">
      <FormInput
        websiteList={websiteList}
        setFormData={setFormData}
        setReloadData={getWebsiteAnalyticDetail}
      />
      <PageViewAnalytics
        websiteInfo={websiteInfo}
        loading={loading}
        analyticsType={formData?.analysicType}
        liveUser={liveUser?.length}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <SourceWidget
          websiteAnalytics={websiteInfo?.analytics}
          loading={loading}
        />
        <ClickedLinksWidget
          clickedLinks={websiteInfo?.analytics?.clickedLinks}
          loading={loading}
        />
        <VisitorPageviewsWidget
          visitorPageviews={websiteInfo?.analytics?.visitorPageviews}
          loading={loading}
          websiteId={activeWebsiteId as string}
        />
      </div>
    </div>
  );
}

export default WebsiteDetail;
