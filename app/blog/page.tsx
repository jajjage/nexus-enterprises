import { listPublishedPosts } from "@/lib/blog";
import { PostCard } from "@/components/blog/post-card";

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container">
        <div className="mb-10 flex items-end justify-between gap-4">
          <header>
            <h1 className="text-4xl font-semibold text-emerald-800 sm:text-5xl">Latest News &amp; Events</h1>
            <p className="mt-2 text-base text-slate-600">Stay updated with the latest developments</p>
          </header>
        </div>

        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            No published posts yet.
          </div>
        )}
      </div>
    </main>
  );
}
