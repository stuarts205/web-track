import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClickedLinkType } from "@/configs/type";
import React from "react";

interface ClickedLinksWidgetProps {
  clickedLinks: ClickedLinkType[] | undefined;
  loading: boolean;
}

export const ClickedLinksWidget = ({
  clickedLinks,
  loading,
}: ClickedLinksWidgetProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clicked Links and Images</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Loading click events...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!clickedLinks || clickedLinks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clicked Links and Images</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No click events tracked yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clicked Links and Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {clickedLinks.map((link, index) => {
          const displayText = link.label?.trim() ? link.label : link.url;
          const isHttp =
            link.url.startsWith("http://") || link.url.startsWith("https://");

          return (
            <div
              key={`${link.url}-${index}`}
              className="flex items-center justify-between gap-4 rounded-md border p-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {link.eventType === "image" ? "Image" : "Link"}
                </p>
                {isHttp ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate font-medium hover:underline"
                    title={link.url}
                  >
                    {displayText}
                  </a>
                ) : (
                  <p className="block truncate font-medium" title={link.url}>
                    {displayText}
                  </p>
                )}
                <p
                  className="truncate text-xs text-muted-foreground"
                  title={link.url}
                >
                  {link.url}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-semibold">{link.clicks}</p>
                <p className="text-xs text-muted-foreground">clicks</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
