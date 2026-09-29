// Turns a title into a URL slug: "Hello World" → "hello-world".
export function slug(text: string): string {
  return text.toLowerCase().replace(" ", "-");
}
