import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import type { Post } from "@prisma/client";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {post.coverImage ? (
        <div className="relative h-52 w-full bg-slate-100">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        </div>
      ) : null}
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="font-medium text-slate-600">News</span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <h3 className="text-3xl leading-tight font-semibold text-emerald-800">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt ? <p className="line-clamp-3 text-lg leading-7 text-slate-600">{post.excerpt}</p> : null}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:underline"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}
