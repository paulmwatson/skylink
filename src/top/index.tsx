import { useEffect, useRef, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Search, ArrowDown } from "lucide-react";

interface LinkCounter {
  [link: string]: number;
}

export default function Page() {
  const [linkCounter, setLinkCounter] = useState<LinkCounter>({});
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post");
    const wsCurrent = ws.current;

    wsCurrent.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.kind === 'commit' && data.commit.record?.facets) {
        const links = data.commit.record.facets
          .flatMap((facet: { features: any; }) => facet.features)
          .filter((feature: { [x: string]: string; }) => feature['$type'] === 'app.bsky.richtext.facet#link')
          .map((feature: { uri: any; }) => feature.uri);

        links.forEach((newLink: string) => {
          try {
            const validateURL = new URL(newLink);
            setLinkCounter((prevCounter) => {
              const updatedCounter = { ...prevCounter };
              updatedCounter[newLink] = (updatedCounter[newLink] || 0) + 1;
              return updatedCounter;
            });
          } catch (e) {
            if (e instanceof TypeError) {
              console.debug(`Not a valid URL, it happens: ${newLink}`)
            } else {
              console.error(e);
            }
          }
        });
      }
    };

    return () => {
      wsCurrent.close();
    };
  }, []);

  const sortedLinks = Object.entries(linkCounter)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 100);

  return (
    <>
      <section>
        <h2 className="text-2xl font-bold tracking-tight">Live Top 1000 URLs on Bluesky</h2>
        <p className="text-muted-foreground">Live tally of links mentioned on Bluesky. Runs in your browser, nothing is stored.</p>
        <Table className="table-auto w-full my-2">
          <TableHeader>
            <TableRow>
              <TableHead>
              </TableHead>
              <TableHead className="w-full">URL</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead className="flex items-center whitespace-nowrap">
                Mentions
                <ArrowDown size={12} className="ml-2" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLinks.map(([link, count]) =>
              <TableRow key={link}>
                <TableCell className="text-center">
                  <a href={`https://bsky.app/search?q=${encodeURIComponent(link)}`} target="_blank" title="Search Bsky.app for this URL" className="hover:text-sky-700">
                    <Search size={12} />
                  </a>
                </TableCell>
                <TableCell className="max-w-xs truncate whitespace-nowrap">
                  <a href={link} target="_blank" className="hover:text-sky-700">
                    {link.replace('http://', '')
                      .replace('https://', '')
                      .replace('www.', '')}
                  </a>
                </TableCell>
                <TableCell>{new URL(link).host.replace("www.", '')}</TableCell>
                <TableCell className="text-center">{count}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </>
  )
}