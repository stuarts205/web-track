"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React, { Suspense } from "react";
import WebsiteForm from "./_components/website-form";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import GeneratedScript from "./_components/generated-script";

const AddWebsiteContent = () => {
  const searchParams = useSearchParams();
  const step = searchParams.get("step");

  if (step === "script") {
    return (
      <div className=" flex items-center w-full justify-center mt-10 ">
        <div className="max-w-lg flex flex-col items-start w-full">
          <Link href={"/dashboard"}>
            <Button className="cursor-pointer">
              {" "}
              <ArrowLeft />
              Dashbaord
            </Button>
          </Link>
          <div className="mt-10 w-full">
            <GeneratedScript />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-10 w-full">
      <div className="max-w-lg flex flex-col items-start w-full">
        <Button variant="outline">
          <ArrowLeft />
          Dashboard
        </Button>
        <div className="mt-10 w-full">
          <WebsiteForm />
        </div>
      </div>
    </div>
  );
};

const AddWebsite = () => {
  return (
    <Suspense fallback={<div className="mt-10 text-center">Loading...</div>}>
      <AddWebsiteContent />
    </Suspense>
  );
};

export default AddWebsite;
