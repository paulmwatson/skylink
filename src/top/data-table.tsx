"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileDown, Pause, Play } from "lucide-react"
import { LinkWithCount } from "@/types"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  postCount: number,
  downloadJSON: Function,
  downloadCSV: Function,
  setPauseCollection: Function,
  pauseCollection: Boolean,
  linksWithCount: LinkWithCount
}

export function DataTable<TData, TValue>({
  columns,
  data,
  postCount,
  downloadJSON,
  downloadCSV,
  setPauseCollection,
  pauseCollection,
  linksWithCount
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "lastSeen",
      desc: false
    }
  ]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Table className="table-auto w-full has-sticky-header">
      <TableHeader className="sticky top-0 bg-white">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header, i) => {
              return (
                <TableHead key={header.id} className={i === 1 ? 'w-full' : ''}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="bg-gray-100">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell, i) => (
                <TableCell key={cell.id} className={i === 1 ? 'max-w-xs truncate whitespace-nowrap' : ''}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length}>
              Connecting...
            </TableCell>
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
              size={"sm"}
              title="Download all collected links as a JSON file"
              className="text-muted-foreground mr-2">
              <FileDown size={12} className="text-muted-foreground" />
              Download JSON
            </Button>
            <Button
              onClick={() => downloadCSV()}
              variant="outline"
              size={"sm"}
              title="Download all collected links as a CSV file"
              className="text-muted-foreground mr-2">
              <FileDown size={12} className="text-muted-foreground" />
              Download CSV
            </Button>
            {pauseCollection && <Button variant="outline" size={"sm"} onClick={() => setPauseCollection(false)} title="Resume collection of links">
              <Play size={12} className="text-muted-foreground text-green-400" />
            </Button>}
            {!pauseCollection && <Button variant="outline" size={"sm"} onClick={() => setPauseCollection(true)} title="Pause collection of links">
              <Pause size={12} className="text-muted-foreground text-yellow-500" />
            </Button>}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}