"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WebsiteInfoType, WebsiteType } from "@/configs/type";
import axios from "axios";
import WebsiteCard from "./_components/website-card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const Dashboard = () => {
  const [websiteList, setWebsiteList] = useState<WebsiteInfoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserWebsites();
  }, []);

  const getUserWebsites = async () => {
    setLoading(true);
    const tooday = format(new Date(), "yyyy-MM-dd");
    const result = await axios.get(`/api/website?from=${tooday}&to=${tooday}`);
    setWebsiteList(result.data);
    setLoading(false);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-xl">My web track dashboard</h2>
        <Link href="/dashboard/new">
          <Button>+ Website</Button>
        </Link>
      </div>
      <div>
        <div>
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {[1, 2, 3, 4].map((item, index) => {
                return (
                  <div key={index} className="border p-4">
                    <div className="flex items-center gap-4 p-4">
                      <Skeleton className="h-8 w-8 rounded-sm" />
                      <Skeleton className="h-4 w-1/2 rounded-sm mt-2" />
                    </div>
                    <Skeleton className="h-[80px] w-full mt-4" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {!loading && websiteList?.length === 0 ? (
          <div className="flex flex-col justify-center items-center gap-4 p-8 border-2 border-dashed rounded-xl mt-5">
            <Image src="/website.png" alt="websites" width={100} height={100} />
            <h2>You don't have any web sites added for tracking</h2>
            <Link href="/dashboard/new">
              <Button>+ Website</Button>
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5 lg:grid-cols-3 mt-5'>
            {websiteList?.map((website, index) => (
              <WebsiteCard websiteinfo={website} key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
