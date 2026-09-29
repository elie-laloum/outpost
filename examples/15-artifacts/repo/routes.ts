// The routes of a small library API.
type Handler = (request: Request) => Response;

export const routes: Record<string, Handler> = {
  "GET /books": () => Response.json([]),
  "GET /books/:id": () => Response.json({}),
  "POST /books": () => new Response(null, { status: 201 }),
  "DELETE /books/:id": () => new Response(null, { status: 204 }),
  "GET /authors": () => Response.json([]),
};
