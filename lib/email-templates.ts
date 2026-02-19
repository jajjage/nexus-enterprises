export function welcomeEmail() {
  return {
    subject: "Welcome to Nexus Updates",
    html: `<p>Thanks for subscribing to Nexus Enterprises updates.</p>` ,
  };
}

export function postBroadcastEmail({
  title,
  excerpt,
  url,
  coverImage,
}: {
  title: string;
  excerpt?: string | null;
  url: string;
  coverImage?: string | null;
}) {
  return {
    subject: `New post: ${title}`,
    html: `
      <div>
        <h2>${title}</h2>
        ${coverImage ? `<p><img src="${coverImage}" alt="${title}" style="max-width:100%;height:auto" /></p>` : ""}
        <p>${excerpt ?? "Read the latest update."}</p>
        <p><a href="${url}">Read the full post</a></p>
      </div>
    `,
  };
}
