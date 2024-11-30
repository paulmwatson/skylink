import { useEffect, useRef, useState } from "react";
import { parse } from "tldts";
import Papa from "papaparse";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Search,
  ArrowDown,
  ArrowUp,
  FileDown,
  Play,
  Pause
} from "lucide-react";

interface LinkInfo {
  mentions: number;
  domain: string | null;
  publicSuffix: string | null;
  cleanedUrl: string | null;
  encodedUrl: string | null;
  seen: Date[];
  firstSeen: Date;
  lastSeen: Date;
}

type SortableColumn = 'mentions' | 'domain' | 'publicSuffix' | 'cleanedUrl' | 'firstSeen' | 'lastSeen';
type LinkWithCount = { [key: string]: LinkInfo };
type LinkWithInfo = [string, LinkInfo];

export default function Page() {
  const [linksWithCount, setLinksWithCount] = useState<LinkWithCount>({});
  const [sortedLinks, setSortedLinks] = useState<LinkWithInfo[]>([]);
  const [sortedColumn, setSortedColumn] = useState<SortableColumn>('lastSeen');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [postCount, setPostCount] = useState<number>(0);
  const [pauseCollection, setPauseCollection] = useState<Boolean>(false);

  const pauseCollectionRef = useRef<Boolean>(pauseCollection);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    pauseCollectionRef.current = pauseCollection;
  }, [pauseCollection]);

  useEffect(() => {
    ws.current = new WebSocket("wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post");
    const wsCurrent = ws.current;

    wsCurrent.onmessage = event => {
      if (pauseCollectionRef.current) return;
      const data = JSON.parse(event.data);
      setPostCount(prevCount => prevCount + 1);

      if (data.kind === 'commit' && data.commit.record?.facets) {
        const createdAt = new Date(data.time_us / 1000);
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
              if (updatedCounter[newLink]) {
                const existingLinkInfo = updatedCounter[newLink];
                existingLinkInfo.seen.push(createdAt);
                existingLinkInfo.lastSeen = createdAt;
                existingLinkInfo.mentions += 1;
              } else {
                updatedCounter[newLink] = {
                  mentions: 1,
                  domain: parsedLink.domain,
                  publicSuffix: parsedLink.publicSuffix,
                  cleanedUrl: newLink.replace('http://', '')
                    .replace('https://', '')
                    .replace('www.', ''),
                  encodedUrl: encodeURIComponent(newLink),
                  seen: [createdAt],
                  firstSeen: createdAt,
                  lastSeen: createdAt
                };
              }

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
      let comparison = 0;
      if (column === 'mentions') {
        comparison = valueB[column] - valueA[column];
        if (sortDirection === 'asc') {
          comparison = valueA[column] - valueB[column];
        }
      }
      else if (column === 'firstSeen' || column === 'lastSeen') {
        const dateA = valueA[column] as Date;
        const dateB = valueB[column] as Date;
        comparison = dateB.getTime() - dateA.getTime();
        if (sortDirection === 'asc') {
          comparison = dateA.getTime() - dateB.getTime();
        }
      }
      else {
        const stringA = (valueA[column] as string) || '';
        const stringB = (valueB[column] as string) || '';
        comparison = stringB.localeCompare(stringA);
        if (sortDirection === 'asc') {
          comparison = stringA.localeCompare(stringB);
        }
      }

      return comparison;
    }).slice(0, 1000);

    setSortedLinks(sorted);
  };

  const changeSort = (column: SortableColumn) => {
    setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    setSortedColumn(column);
  }

  const downloadCSV = () => {
    const data = Object.entries(linksWithCount).map(([url, linkInfo]) => ({
      mentions: linkInfo.mentions,
      domain: linkInfo.domain,
      publicSuffix: linkInfo.publicSuffix,
      firstSeen: linkInfo.firstSeen,
      lastSeen: linkInfo.lastSeen,
      url
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'skylink.csv';
    link.click();
  };

  const downloadJSON = () => {
    const jsonString = JSON.stringify(linksWithCount, (key, value) => {
      if (key === 'encodedUrl' || key === 'cleanedUrl') {
        return undefined;
      }
      return value;
    });
    const blob = new Blob([jsonString], { type: 'text/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'skylink.json';
    link.click();
  };

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

  const PausedIndicator = () => {
    if (pauseCollection) return <Button variant="outline" size="sm" onClick={() => setPauseCollection(false)} title="Resume collection of links">
      <Play size="sm" className="text-muted-foreground text-green-500" />
    </Button>
    else
      return <Button variant="outline" size="sm" onClick={() => setPauseCollection(true)} title="Pause collection of links">
        <Pause size="sm" className="text-muted-foreground text-yellow-500" />
      </Button>;
  };

  return (
    <section>
      <header className="p-5">
        <h2 className="text-2xl font-bold tracking-tight">Links On Bluesky</h2>
        <p className="text-muted-foreground">Live tally of unique links mentioned in Bluesky posts. Runs in your browser, nothing is stored.</p>
      </header>
      <Table className="table-auto w-full has-sticky-header">
        <TableHeader className="sticky top-0 bg-white">
          <TableRow>
            <TableHead>
              <img alt="A blue butterfly, the Bluesky logo" src="/images/bluesky-logo.svg" width="12" height="12" className="mx-auto" />
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
                <abbr title="Public Suffix">TLD</abbr>
                {SortDirectionIndicator("publicSuffix")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:text-sky-700" onClick={() => changeSort('mentions')}>
              <div className="flex items-center whitespace-nowrap">
                Mentions
                {SortDirectionIndicator("mentions")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:text-sky-700" onClick={() => changeSort('firstSeen')}>
              <div className="flex items-center whitespace-nowrap">
                First Seen
                {SortDirectionIndicator("firstSeen")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:text-sky-700" onClick={() => changeSort('lastSeen')}>
              <div className="flex items-center whitespace-nowrap">
                Last Seen
                {SortDirectionIndicator("lastSeen")}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-gray-100">
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
              <TableCell className="text-center text-xs whitespace-nowrap">{item.seen[0].toLocaleString()}</TableCell>
              <TableCell className="text-center text-xs whitespace-nowrap">{item.seen[item.seen.length - 1].toLocaleString()}</TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter className="sticky bottom-0 text-sm bg-white">
          <TableRow>
            <TableCell className="whitespace-nowrap" colSpan={2}>
              <Badge variant="outline" className="mr-2 font-mono text-muted-foreground">
                {postCount.toLocaleString()} Posts
              </Badge>
              <Badge variant="outline" className="font-mono text-muted-foreground">
                {Object.entries(linksWithCount).length.toLocaleString()} Unique Links
              </Badge>
            </TableCell>
            <TableCell colSpan={5} className="text-right">
              <Button
                onClick={() => downloadJSON()}
                variant="outline"
                size="sm"
                title="Download all collected links as a JSON file"
                className="text-muted-foreground mr-2">
                <FileDown size="sm" className="text-muted-foreground" />
                Download JSON
              </Button>
              <Button
                onClick={() => downloadCSV()}
                variant="outline"
                size="sm"
                title="Download all collected links as a CSV file"
                className="text-muted-foreground mr-2">
                <FileDown size="sm" className="text-muted-foreground" />
                Download CSV
              </Button>
              {PausedIndicator()}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </section>

  )
}