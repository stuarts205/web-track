import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";

function AppHeader() {
  const { user } = useUser();
  return (
    <header className="z-50 w-full bg-white py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 sm:py-0 landscape:py-1">
      <nav
        className="relative mx-auto w-full max-w-7xl px-1 py-3 sm:flex sm:items-center sm:justify-between sm:px-4 lg:px-6 landscape:py-2"
        aria-label="Global"
      >
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Image
              src={"/logo2.png"}
              alt="logo"
              width={150}
              height={150}
              className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
            />
            <h2 className="truncate text-xl font-medium sm:text-2xl">
              WebTrack
            </h2>
          </div>
        </div>
        <div
          id="navbar-collapse-with-animation"
          className="hs-collapse basis-full overflow-hidden transition-all duration-300 sm:block sm:basis-auto"
        >
          <div className="mt-2 flex items-center justify-end sm:mt-0 sm:cursor-pointer sm:ps-7 landscape:mt-1">
            {/* Clerk Authentication  */}
            {!user ? (
              <SignInButton mode="modal" signUpForceRedirectUrl={"/dashboard"}>
                <div className="flex items-center gap-x-2 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 sm:ms-4 sm:my-4 sm:border-s sm:border-gray-300 sm:py-0 sm:ps-6 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-blue-500 landscape:py-1 landscape:sm:my-2">
                  <svg
                    className="size-4 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                  </svg>
                  Get Started
                </div>
              </SignInButton>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default AppHeader;
