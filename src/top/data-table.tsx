"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, FileDown, Pause, Play } from "lucide-react"
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
      id: "dids",
      desc: false
    }
  ]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 500,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination
    },

    autoResetPageIndex: false
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
          <TableCell colSpan={2}>
            <Badge variant="outline" className="mx-1 font-mono text-muted-foreground">
              {postCount.toLocaleString()} Posts
            </Badge>
            <Badge variant="outline" className="mx-1 font-mono text-muted-foreground">
              {Object.entries(linksWithCount).length.toLocaleString()} Unique Links
            </Badge>
          </TableCell>
          <TableCell className="text-right" colSpan={columns.length - 2}>
            <Button
              onClick={() => downloadJSON()}
              variant="outline"
              size={"sm"}
              title="Download all collected links as a JSON file"
              className="text-muted-foreground mx-1">
              <FileDown size={12} className="text-muted-foreground" />
              Download JSON
            </Button>
            <Button
              onClick={() => downloadCSV()}
              variant="outline"
              size={"sm"}
              title="Download all collected links as a CSV file"
              className="text-muted-foreground mx-1">
              <FileDown size={12} className="text-muted-foreground" />
              Download CSV
            </Button>
            <Button
              className="mx-1"
              variant="outline"
              size={"sm"}
              onClick={() => setPagination({
                pageIndex: 0,
                pageSize: pagination.pageSize,
              })}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronFirst />
            </Button>
            <Button
              className="mx-1"
              variant="outline"
              size={"sm"}
              onClick={() => setPagination({
                pageIndex: table.getState().pagination.pageIndex - 1,
                pageSize: pagination.pageSize,
              })}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
            </Button>
            {pauseCollection && <Button 
              className="text-muted-foreground mx-1 text-xs" 
              variant="outline" 
              size={"sm"} 
              onClick={() => setPauseCollection(false)} 
              title="Resume collection of links">
              <Play size={12} className="text-muted-foreground text-green-400" />
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </Button>}
            {!pauseCollection && <Button
              className="text-muted-foreground mx-1 text-xs"
              variant="outline"
              size={"sm"}
              onClick={() => setPauseCollection(true)} 
              title="Pause collection of links">
              <Pause size={12} className="text-muted-foreground text-yellow-500" />
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </Button>}
            <Button
              className="mx-1"
              variant="outline"
              size={"sm"}
              onClick={() => setPagination({
                pageIndex: table.getState().pagination.pageIndex + 1,
                pageSize: pagination.pageSize,
              })}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight />
            </Button>
            <Button
              className="mx-1"
              variant="outline"
              size={"sm"}
              onClick={() => setPagination({
                pageIndex: table.getPageCount() - 1,
                pageSize: pagination.pageSize,
              })}
              disabled={!table.getCanNextPage()}
            >
              <ChevronLast />
            </Button>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}