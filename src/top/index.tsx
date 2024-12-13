import { useEffect, useRef, useState } from "react";
import { LinkWithCount, LinkWithInfo, OpenGraphData } from "@/types";
import { parse } from "tldts";
import Papa from "papaparse";

import { columns } from "./columns";
import { DataTable } from "./data-table";

const lowercaseUrlHostname = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
    return parsedUrl.toString();
  } catch (error) {
    return url;
  }
}

export default function Page() {
  const [linksWithCount, setLinksWithCount] = useState<LinkWithCount>({});
  const [sortedLinks, setSortedLinks] = useState<LinkWithInfo[]>([]);
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
        const did = data.did;
        const links = data.commit.record.facets
          .flatMap((facet: { features: any; }) => facet.features)
          .filter((feature: { [x: string]: string; }) => feature['$type'] === 'app.bsky.richtext.facet#link')
          .map((feature: { uri: any; }) => lowercaseUrlHostname(feature.uri));

        links.forEach((newLink: string) => {
          const parsedLink = parse(newLink);
          // Not every app.bsky.richtext.facet#link is a valid URL
          if (parsedLink.domain !== null) {
            setLinksWithCount((prevCounter) => {
              const updatedCounter = { ...prevCounter };
              if (updatedCounter[newLink]) {
                const existingLinkInfo = updatedCounter[newLink];
                existingLinkInfo.seen.push(createdAt);
                existingLinkInfo.dids.add(did);
                existingLinkInfo.lastSeen = createdAt;
                existingLinkInfo.mentions += 1;
              } else {
                updatedCounter[newLink] = {
                  mentions: 1,
                  domain: parsedLink.domain || '',
                  publicSuffix: parsedLink.publicSuffix || '',
                  cleanedUrl: newLink.replace('http://', '')
                    .replace('https://', '')
                    .replace('www.', ''),
                  encodedUrl: encodeURIComponent(newLink),
                  seen: [createdAt],
                  dids: new Set([did]),
                  firstSeen: createdAt,
                  lastSeen: createdAt,
                  originalUrl: newLink
                };
              }

              fetch(`/api/meta?url=${encodeURIComponent(newLink)}`).then((response) => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch OG data: ${response.status}`);
                }
                return response.json();
              })
                .then((ogData: OpenGraphData) => {
                  updatedCounter[newLink].meta = ogData;
                }).catch((error) => {
                  console.error(`Error fetching OG data for ${newLink}:`, error);
                });

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

  const sortLinks = () => {
    const sorted = Object.entries(linksWithCount);
    setSortedLinks(sorted);
  };

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
      return (value instanceof Set ? [...value] : value)
    });

    const blob = new Blob([jsonString], { type: 'text/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'skylink.json';
    link.click();
  };

  useEffect(() => {
    sortLinks();
  }, [linksWithCount]);

  return (
    <section>
      <header className="p-5">
        <h2 className="text-2xl font-bold tracking-tight">Skylink</h2>
        <p className="text-muted-foreground">Live tally of unique links mentioned in Bluesky posts. Runs in your browser, nothing is stored.</p>
      </header>
      <DataTable
        columns={columns}
        data={sortedLinks.map((linkWithInfo) => linkWithInfo[1])}
        postCount={postCount}
        downloadJSON={downloadJSON}
        downloadCSV={downloadCSV}
        setPauseCollection={setPauseCollection}
        pauseCollection={pauseCollection}
        linksWithCount={linksWithCount}
      />
    </section>
  )
};