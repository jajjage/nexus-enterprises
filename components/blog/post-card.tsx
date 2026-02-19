import Link from "next/link";
import Image from "next/image";
import type { Post } from "@prisma/client";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {post.coverImage ? (
        <div className="relative h-44 w-full">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        </div>
      ) : null}
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--color-primary)]">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt ? <p className="mt-2 text-sm text-slate-600 line-clamp-2">{post.excerpt}</p> : null}
        <Link href={`/blog/${post.slug}`} className="mt-3 inline-flex text-sm font-semibold text-[var(--color-accent)] hover:underline">
          Read more -&gt;
        </Link>
      </div>
    </article>
  );
}
