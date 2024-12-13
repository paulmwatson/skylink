import type { Config } from "@netlify/edge-functions";
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import { OpenGraphData } from "../../src/types.ts";

export default async (request: Request): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(
      JSON.stringify({ error: 'URL parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'skylink.paulmwatson.com/1'
      }
    });
    if (!response.ok) {
      return new Response(JSON.stringify({
        url: url,
        status: response.status
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
        },

      });
    }
    const html = await response.text();

    // Parse the HTML using DOMParser
    const document = new DOMParser().parseFromString(html, 'text/html');

    if (!document) {
      return new Response('Failed to parse HTML', { status: 500 });
    }

    // Use querySelectorAll to get elements (example: all links)
    const title =
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      document.querySelector('title')?.textContent ||
      undefined;

    const description =
      document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      document.querySelector('meta[name="description"]')?.getAttribute('content') ||
      undefined;

    const image = document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute('content');

    const ogUrl = document
      .querySelector('meta[property="og:url"]')
      ?.getAttribute('content') || url;


    // Populate the ogData object with the matches
    const ogData: OpenGraphData = {
      title: title,
      description: description,
      image: image,
      url: ogUrl,
      status: response.status
    }

    return new Response(JSON.stringify(ogData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      },

    });
  } catch (error) {
    return new Response(JSON.stringify({
      url: url
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      },

    });
  }
};


export const config: Config = {
  path: "/api/meta",
};