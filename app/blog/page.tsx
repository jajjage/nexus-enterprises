import { listPublishedPosts } from "@/lib/blog";
import { SubscribeCard } from "@/components/blog/subscribe-card";
import { PostCard } from "@/components/blog/post-card";

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();

  const withCta = [] as Array<{ type: "post" | "cta"; data?: (typeof posts)[number] }>;
  posts.forEach((p, idx) => {
    if (idx === 3) withCta.push({ type: "cta" });
    withCta.push({ type: "post", data: p });
  });

  return (
    <main className="section-space bg-white">
      <div className="site-container">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">Insights</p>
            <h1 className="text-4xl font-semibold text-[var(--color-primary)]">Blog</h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {withCta.map((item, idx) =>
            item.type === "post" && item.data ? (
              <PostCard key={item.data.id} post={item.data} />
            ) : (
              <SubscribeCard key={`cta-${idx}`} />
            ),
          )}
        </div>
      </div>
    </main>
  );
}
