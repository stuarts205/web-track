"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CountryType } from "@/configs/type";
import React, { useMemo } from "react";

interface ViewsByCountryWidgetProps {
  countries: CountryType[] | undefined;
  loading: boolean;
  showAll?: boolean;
}

export const ViewsByCountryWidget = ({
  countries,
  loading,
  showAll = false,
}: ViewsByCountryWidgetProps) => {
  const sortedCountries = useMemo(
    () => [...(countries ?? [])].sort((a, b) => b.uv - a.uv),
    [countries],
  );

  const totalVisitors = sortedCountries.reduce((sum, item) => sum + item.uv, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Views by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Loading country views...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (sortedCountries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Views by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No country views tracked yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Views by Country</CardTitle>
        <p className="text-sm text-muted-foreground">
          {sortedCountries.length}{" "}
          {sortedCountries.length === 1 ? "country has" : "countries have"}{" "}
          visited this website
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Visitors</TableHead>
              <TableHead className="text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(showAll ? sortedCountries : sortedCountries.slice(0, 10)).map(
              (item, index) => (
              <TableRow key={item.name}>
                <TableCell className="text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={item.image}
                      alt={`${item.name} flag`}
                      width={20}
                      height={14}
                      className="rounded-sm border"
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {item.uv}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {totalVisitors
                    ? ((item.uv / totalVisitors) * 100).toFixed(1)
                    : "0.0"}
                  %
                </TableCell>
              </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
