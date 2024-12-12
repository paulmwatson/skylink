"use client"

import { Button } from "@/components/ui/button"
import { LinkInfo } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ClockArrowDown, ClockArrowUp, MessageCircle, Search, UserPen, Image } from "lucide-react"

const formattedTime = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

export const columns: ColumnDef<LinkInfo>[] = [
  {
    accessorKey: "cleanedUrl",
    header: ({ column }) => {
      return (
        <Button
          className="w-full text-left justify-normal"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Link
          {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowUp className="ml-2 h-4 w-4 text-slate-200 dark:text-slate-800" />}
        </Button>
      )
    },
    cell: ({ row }) => {
      return <a href={row.original.originalUrl} target="_blank" className="flex items-center space-x-2 ml-1 hover:text-sky-500">
        <span className="relative flex shrink-0 overflow-hidden rounded">
          {row.original.meta?.image === undefined && <Image strokeWidth={0.5} className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
          {row.original.meta?.image !== undefined && <img src={row.original.meta?.image} className="object-cover h-12 w-12" />}
        </span>
        <div className="">
          <p className="leading-none text-base mb-1">{row.original.meta?.title || row.original.domain}</p>
          <p className="text-xs text-muted-foreground truncate whitespace-nowrap max-w-xs">{row.original.cleanedUrl.toLocaleString()}</p>
        </div>
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
          {!column.getIsSorted() && <ArrowUp className="ml-2 h-4 w-4 text-slate-200 dark:text-slate-800" />}
        </Button>
      )
    },
    cell: ({ row }) => <div className="min-w-48 max-w-48 truncate whitespace-nowrap text-muted-foreground">{row.original.domain}</div>
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
          {!column.getIsSorted() && <ArrowUp className="ml-2 h-4 w-4 text-slate-200 dark:text-slate-800" />}
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-muted-foreground">{row.original.publicSuffix}</div>,
  },
  {
    accessorKey: "dids",
    invertSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <abbr title="Unique posters">
            <UserPen />
          </abbr>
          {column.getIsSorted() === "asc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowDown className="ml-2 h-4 w-4 text-slate-200 dark:text-slate-800" />}
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.dids.size}</div>,
    sortingFn: (rowA, rowB) => {
      const setA = rowA.getValue('dids') as Set<string>;
      const setB = rowB.getValue('dids') as Set<string>;
      const sizeA = setA.size;
      const sizeB = setB.size;

      if (sizeA < sizeB) return -1;
      if (sizeA > sizeB) return 1;
      return 0;
    }
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
          <abbr title="Number of mentions of the URL">
            <MessageCircle />
          </abbr>
          {column.getIsSorted() === "asc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowDown className="ml-2 h-4 w-4 text-slate-200 dark:text-slate-800" />}
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.mentions.toLocaleString()}</div>
  },

  {
    accessorKey: "firstSeen",
    invertSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          title="When the URL was first seen"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ClockArrowUp />
          {column.getIsSorted() === "asc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowDown className="ml-2 h-4 w-4 text-slate-200 dark:text-slate-800" />}
        </Button>
      )
    },
    cell: ({ row }) => <abbr title={row.original.firstSeen.toTimeString()} className="text-xs text-center block whitespace-nowrap text-muted-foreground">{formattedTime(row.original.firstSeen)}</abbr>
  },
  {
    accessorKey: "lastSeen",
    invertSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          title="When the URL was last seen"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ClockArrowDown />
          {column.getIsSorted() === "asc" && <ArrowDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowDown className="ml-2 h-4 w-4 text-slate-200 dark:text-slate-800" />}
        </Button>
      )
    },
    cell: ({ row }) => <abbr title={row.original.lastSeen.toTimeString()} className="text-xs text-center block whitespace-nowrap text-muted-foreground">{formattedTime(row.original.lastSeen)}</abbr>
  },
  {
    accessorKey: "encodedUrl",
    header: () => <img alt="A blue butterfly, the Bluesky logo" src="/images/bluesky-logo.svg" width="12" height="12" className="mx-auto" />,
    cell: ({ row }) => <a href={`https://bsky.app/search?q=${row.original.encodedUrl}`} target="_blank" title="Search Bsky.app for this URL" className="mx-auto block hover:text-sky-700">
      <Search size={12} className="mr-2 ml-1" />
    </a>
  },
]
