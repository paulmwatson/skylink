"use client"

import { Button } from "@/components/ui/button"
import { LinkInfo } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, Search } from "lucide-react"

export const columns: ColumnDef<LinkInfo>[] = [
  {
    accessorKey: "encodedUrl",
    header: () => <img alt="A blue butterfly, the Bluesky logo" src="/images/bluesky-logo.svg" width="12" height="12" className="mx-auto" />,
    cell: ({ row }) => <a href={`https://bsky.app/search?q=${row.original.encodedUrl}`} target="_blank" title="Search Bsky.app for this URL" className="mx-auto block hover:text-sky-700">
      <Search size={12} />
    </a>
  },
  {
    accessorKey: "cleanedUrl",
    header: ({ column }) => {
      return (
        <Button
          className="flex w-full"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          URL
          {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowUp className="ml-2 h-4 w-4 text-slate-200" />}
        </Button>
      )
    },
    cell: ({ row }) => {
      return <a href={row.original.originalUrl} target="_blank" className="hover:text-sky-700">
        {row.original.cleanedUrl.toLocaleString()}
      </a>

    }
  },
  {
    accessorKey: "domain",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Domain
          {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowUp className="ml-2 h-4 w-4 text-slate-200" />}
        </Button>
      )
    },
  },
  {
    accessorKey: "publicSuffix",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <abbr title="Public Suffix">TLD</abbr>
          {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowUp className="ml-2 h-4 w-4 text-slate-200" />}
        </Button>
      )
    },
  },
  {
    accessorKey: "mentions",
    invertSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mentions
          {column.getIsSorted() === "asc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowDown className="ml-2 h-4 w-4 text-slate-200" />}
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-center">{row.original.mentions.toLocaleString()}</div>
  },
  {
    accessorKey: "firstSeen",
    invertSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Seen
          {column.getIsSorted() === "asc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowDown className="ml-2 h-4 w-4 text-slate-200" />}
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-xs whitespace-nowrap">{row.original.firstSeen.toLocaleString()}</div>
  },
  {
    accessorKey: "lastSeen",
    invertSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Seen
          {column.getIsSorted() === "asc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowDown className="ml-2 h-4 w-4 text-slate-200" />}
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-xs whitespace-nowrap">{row.original.lastSeen.toLocaleString()}</div>
  },
]
