export type WebsiteType = {
  id: number;
  websiteId: string;
  domain: string;
  timezone: string;
  enableLocalhostTracking: boolean;
  userEmail: string;
};

export type WebsiteInfoType = {
  website: WebsiteType;
  analytics: AnalyticsType;
};

export type AnalyticsType = {
  avgActiveTime: number;
  totalActiveTime: number;
  totalSessions: number;
  totalVisitors: number;
  hourlyVisitors: HourlyVisitorsType[];
  dailyVisitors: DailyVisitorsType[];
  referrals: ReferralsType[];
  refParams: RefParamsType[];
  clickedLinks: ClickedLinkType[];
  visitorPageviews: VisitorPageviewType[];
  swipeStats: SwipeStatsType;
};

export type SwipeStatsType = {
  total: number;
  next: number;
  previous: number;
};

export type VisitorPageviewType = {
  visitorId: string;
  pageviews: number;
};

export type ClickedLinkType = {
  url: string;
  label: string;
  clicks: number;
  eventType: "link" | "image";
};

export type HourlyVisitorsType = {
  count: number;
  date: string;
  hour: number;
  hourLabel: string;
};

export type DailyVisitorsType = {
  count: number;
};

export type ReferralsType = {
  domainName: string;
  uv: number;
  name: string;
};

export type RefParamsType = {
  name: string;
  uv: number;
};

export type LiveUserType = {
  id: number;
  websiteId: string;
  visitorId: string;
  last_seen: number;
  city: string;
  country: string;
  countryCode: string;
  region: string;
  lat: string;
  lng: string;
  device: string;
  os: string;
  browser: string;
};

export const IMAGE_URL_FOR_DOMAINS =
  "https://icons.duckduckgo.com/ip3/<domain>.com.ico";
