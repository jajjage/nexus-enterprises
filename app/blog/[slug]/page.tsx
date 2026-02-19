import { notFound } from "next/navigation";
import Image from "next/image";
import { getPostBySlug } from "@/lib/blog";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="section-space bg-white">
      <div className="site-container max-w-3xl">
        {post.coverImage ? (
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-xl">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
          </div>
        ) : null}
        <p className="text-sm text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
        <h1 className="mt-2 text-4xl font-semibold text-[var(--color-primary)]">{post.title}</h1>
        <div className="mt-6 prose prose-lg prose-blue mx-auto" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </main>
  );
}
