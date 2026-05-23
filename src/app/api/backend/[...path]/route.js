export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_URL;

async function proxyRequest(req, context) {
  if (!BACKEND_URL) {
    return Response.json(
      { error: "BACKEND_URL no configurado" },
      { status: 500 }
    );
  }

  const params = await context.params;
  const path = params.path.join("/");

  const incomingUrl = new URL(req.url);
  const targetUrl = new URL(`${BACKEND_URL}/api/${path}`);

  targetUrl.search = incomingUrl.search;

  const headers = new Headers(req.headers);

  headers.delete("host");
  headers.delete("content-length");

  const method = req.method.toUpperCase();

  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  const backendResponse = await fetch(targetUrl.toString(), {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(backendResponse.headers);

  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(req, context) {
  return proxyRequest(req, context);
}

export async function POST(req, context) {
  return proxyRequest(req, context);
}

export async function PUT(req, context) {
  return proxyRequest(req, context);
}

export async function PATCH(req, context) {
  return proxyRequest(req, context);
}

export async function DELETE(req, context) {
  return proxyRequest(req, context);
}

export async function OPTIONS(req, context) {
  return proxyRequest(req, context);
}