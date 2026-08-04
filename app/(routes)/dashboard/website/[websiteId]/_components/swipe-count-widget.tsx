import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwipeStatsType } from "@/configs/type";

interface SwipeCountWidgetProps {
  swipeStats: SwipeStatsType | undefined;
  loading: boolean;
}

const formatCount = (value: number | undefined) =>
  Number.isFinite(value) ? String(value) : "0";

export const SwipeCountWidget = ({
  swipeStats,
  loading,
}: SwipeCountWidgetProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Swipe Counts</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading swipe counts...
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Total
              </p>
              <p className="text-2xl font-bold">
                {formatCount(swipeStats?.total)}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Next
              </p>
              <p className="text-2xl font-bold">
                {formatCount(swipeStats?.next)}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Previous
              </p>
              <p className="text-2xl font-bold">
                {formatCount(swipeStats?.previous)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
