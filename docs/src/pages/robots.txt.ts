export const prerender = true;

export function GET() {
  const sitemap = new URL(
    `${import.meta.env.BASE_URL.replace(/\/$/, "")}/sitemap-index.xml`,
    "https://elie-laloum.github.io",
  );
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap.href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
