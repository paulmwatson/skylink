export interface OpenGraphData {
  title: string | undefined;
  description: string | undefined;
  image: string | undefined;
  url: string | undefined;
}

export interface LinkInfo {
  mentions: number;
  domain: string;
  publicSuffix: string;
  cleanedUrl: string;
  encodedUrl: string;
  seen: Date[];
  firstSeen: Date;
  lastSeen: Date;
  originalUrl: string;
  dids: Set<string>;
  meta?: OpenGraphData;
}

export type SortableColumn = 'mentions' | 'domain' | 'publicSuffix' | 'cleanedUrl' | 'firstSeen' | 'lastSeen';
export type LinkWithCount = { [key: string]: LinkInfo };
export type LinkWithInfo = [string, LinkInfo];
export type Links = LinkInfo[];
