import Link from "next/link";
import type { Post } from "@prisma/client";

type ServicesGridProps = {
  posts: Array<Pick<Post, "id" | "slug" | "title" | "excerpt" | "coverImage" | "createdAt">>;
};

export function ServicesGrid({ posts }: ServicesGridProps) {
  return (
    <section id="services" className="section-space bg-[var(--color-surface)]">
      <div className="site-container">
        <div className="mb-10 flex items-end justify-between gap-4">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Resources</p>
            <h2 className="mt-3 text-3xl font-semibold text-emerald-800 sm:text-4xl">
              Latest News &amp; Events
            </h2>
            <p className="mt-2 text-base text-slate-600">Stay updated with the latest developments</p>
          </header>
          <Link
            href="/blog"
            className="inline-flex shrink-0 text-sm font-semibold text-emerald-700 transition hover:underline"
          >
            View all →
          </Link>
        </div>

        {posts.length ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {post.coverImage ? (
                  <div className="h-44 overflow-hidden bg-slate-100">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-[var(--color-secondary)]">
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                      News
                    </span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-semibold leading-snug text-[var(--color-primary)]">
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                  ) : null}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent)] transition hover:underline"
                  >
                    Read more -&gt;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            No published posts yet.
          </div>
        )}
      </div>
    </section>
  );
}
