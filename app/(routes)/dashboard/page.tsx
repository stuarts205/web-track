"use client"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";

const Dashboard = () => {
  const [websiteList, setWebsiteList] = useState([]);
  return (
    <div className='mt-8'>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-xl">My web track dashboard</h2>
        <Button>+ Website</Button>
      </div>
      <div>
        {websiteList?.length === 0 ? 
        (
          <div className="flex flex-col justify-center items-center gap-4 p-8 border-2 border-dashed rounded-xl mt-5">
            <Image src="/website.png" alt="websites" width={100} height={100} />
            <h2>You don't have any web sites added for tracking</h2>
            <Button>+ Website</Button>
          </div>
        ) : (
          <div>

          </div>
        ) }
      </div>
    </div>
  );
};

export default Dashboard;
