"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";

export type AdminPost = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
};

type Props = {
  posts: AdminPost[];
  onDelete: (id: string) => Promise<void> | void;
  onBroadcast: (id: string) => Promise<void> | void;
};

export function PostTable({ posts, onDelete, onBroadcast }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Title</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-semibold text-[var(--color-primary)]">{post.title}</TableCell>
              <TableCell>
                <Badge className={post.published ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}>
                  {post.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-600">{new Date(post.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="flex flex-wrap gap-2">
                <Link href={`/admin/blog/${post.id}`} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                  Edit
                </Link>
                <button className="text-sm font-semibold text-rose-600" onClick={() => onDelete(post.id)}>
                  Delete
                </button>
                {post.published ? (
                  <button className="text-sm font-semibold text-[var(--color-accent)]" onClick={() => onBroadcast(post.id)}>
                    Email Subscribers
                  </button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
