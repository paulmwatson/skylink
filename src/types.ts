export interface LinkInfo {
  mentions: number;
  domain: string | null;
  publicSuffix: string | null;
  cleanedUrl: string | null;
  encodedUrl: string | null;
  seen: Date[];
  firstSeen: Date;
  lastSeen: Date;
}

export type SortableColumn = 'mentions' | 'domain' | 'publicSuffix' | 'cleanedUrl' | 'firstSeen' | 'lastSeen';
export type LinkWithCount = { [key: string]: LinkInfo };
export type LinkWithInfo = [string, LinkInfo];
