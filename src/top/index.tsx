import { useEffect, useRef, useState } from "react";
import { parse } from "tldts";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Search, ArrowDown, ArrowUp } from "lucide-react";

interface LinkInfo {
  mentions: number;
  domain: string | null;
  publicSuffix: string | null;
  cleanedUrl: string | null;
  encodedUrl: string | null;
}

type SortableColumn = 'mentions' | 'domain' | 'publicSuffix' | 'cleanedUrl';
type LinkWithCount = { [key: string]: LinkInfo };
type LinkWithInfo = [string, LinkInfo];

export default function Page() {
  const [linksWithCount, setLinksWithCount] = useState<LinkWithCount>({});
  const [sortedLinks, setSortedLinks] = useState<LinkWithInfo[]>([]);
  const [sortedColumn, setSortedColumn] = useState<SortableColumn>('mentions');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [postCount, setPostCount] = useState<number>(0);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post");
    const wsCurrent = ws.current;

    wsCurrent.onmessage = event => {
      const data = JSON.parse(event.data);
      setPostCount(prevCount => prevCount + 1);
      if (data.kind === 'commit' && data.commit.record?.facets) {
        const links = data.commit.record.facets
          .flatMap((facet: { features: any; }) => facet.features)
          .filter((feature: { [x: string]: string; }) => feature['$type'] === 'app.bsky.richtext.facet#link')
          .map((feature: { uri: any; }) => feature.uri);

        links.forEach((newLink: string) => {
          const parsedLink = parse(newLink);
          // Not every app.bsky.richtext.facet#link is a valid URL
          if (parsedLink.domain != null) {
            setLinksWithCount((prevCounter) => {
              const updatedCounter = { ...prevCounter };
              updatedCounter[newLink] = {
                mentions: (updatedCounter[newLink]?.mentions || 0) + 1,
                domain: parsedLink.domain,
                publicSuffix: parsedLink.publicSuffix,
                cleanedUrl: newLink.replace('http://', '')
                  .replace('https://', '')
                  .replace('www.', ''),
                encodedUrl: encodeURIComponent(newLink)
              };
              return updatedCounter;
            });
          }
        });
      }
    };

    return () => {
      wsCurrent.close();
    };
  }, []);

  const sortLinks = (column: keyof LinkInfo) => {
    const sorted = Object.entries(linksWithCount).sort(([_keyA, valueA], [_keyB, valueB]) => {
      if (column === 'mentions') {
        if (sortDirection === 'desc') {
          return valueB[column] - valueA[column];
        } else {
          return valueA[column] - valueB[column];
        }
      } else {
        if (sortDirection === 'desc') {
          return (valueA[column] as string).localeCompare(valueB[column] as string);
        } else {
          return (valueB[column] as string).localeCompare(valueA[column] as string);
        }
      }
    }).slice(0, 1000);

    setSortedLinks(sorted);
  };

  const changeSort = (column: SortableColumn) => {
    setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    setSortedColumn(column);
  }

  useEffect(() => {
    sortLinks(sortedColumn);
  }, [linksWithCount, sortedColumn]);

  const SortDirectionIndicator = (column: string) => {
    if (sortedColumn === column) {
      if (sortDirection === 'desc') {
        return <ArrowDown size={12} className="ml-2" />
      } else {
        return <ArrowUp size={12} className="ml-2" />
      }
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight">Links On Bluesky</h2>
      <p className="text-muted-foreground">Live tally of {Object.entries(linksWithCount).length.toLocaleString()} unique links mentioned in {postCount.toLocaleString()} Bluesky posts. Runs in your browser, nothing is stored.</p>
      <Table className="table-auto w-full my-2 has-sticky-header">
        <TableHeader className="sticky top-0 bg-gray-50">
          <TableRow>
            <TableHead>
              <img alt="A blue butterfly, the Bluesky logo" src="/images/bluesky-logo.svg" width="12" height="12" />
            </TableHead>
            <TableHead className="cursor-pointer hover:text-sky-700 w-full" onClick={() => changeSort('cleanedUrl')}>
              <div className="flex items-center whitespace-nowrap">
                URL
                {SortDirectionIndicator("cleanedUrl")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:text-sky-700" onClick={() => changeSort('domain')}>
              <div className="flex items-center whitespace-nowrap">
                Domain
                {SortDirectionIndicator("domain")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:text-sky-700" onClick={() => changeSort('publicSuffix')}>
              <div className="flex items-center whitespace-nowrap">
                <abbr title="Public Suffix actually">TLD</abbr>
                {SortDirectionIndicator("publicSuffix")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:text-sky-700" onClick={() => changeSort('mentions')}>
              <div className="flex items-center whitespace-nowrap">
                Mentions
                {SortDirectionIndicator("mentions")}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLinks.map(([link, item]) =>
            <TableRow key={link}>
              <TableCell className="text-center">
                <a href={`https://bsky.app/search?q=${item.encodedUrl}`} target="_blank" title="Search Bsky.app for this URL" className="hover:text-sky-700">
                  <Search size={12} />
                </a>
              </TableCell>
              <TableCell className="max-w-xs truncate whitespace-nowrap">
                <a href={link} target="_blank" className="hover:text-sky-700">
                  {item.cleanedUrl}
                </a>
              </TableCell>
              <TableCell>{item.domain}</TableCell>
              <TableCell>{item.publicSuffix}</TableCell>
              <TableCell className="text-center">{item.mentions.toLocaleString()}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>

  )
}