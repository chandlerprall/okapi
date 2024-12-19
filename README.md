# okAPI

A small API server for quick, repeatable usage of API requests.

## Installation

```
pnpm install
```

## Running

```
node src/index.js
```

Now it is accessible at `http://localhost:4000`

## Structure

This server uses a simple file-based routing with each route being a separate file in the `routes` directory, URLs ending in a trailing slash will look for an `index.js` within that directory.

Each route declares an async function as the default export, the function is called with an object containing:

```
{
  ctx: Koa.Context; // Koa context object
  send: (data: string) => void; // Function to send data back to the client
  emitRecord: (record: object) => void; // Function to emit a record to the client
  params: object; // Object containing the URL parameters and also pagination information (page, perPage, after)
  signal: AbortSignal; // Abort signal for the request, if the controller wants to stop executing if the client prematurally disconnects
}
```

`send` and `emitRecord` should not be used together. `emitRecord` manages formatting the response as a JSON array, stringifying each emitting record within it, and understands how to close that array when the response is complete. For any endpoints that don't return an array of records, use `send`.

### API

`/api/data`

emits a number of records

### App

`/app/` - presents a simple web frontend to run through the oauth flow

> [!WARNING]
> The `oauth2-server` package either has a bug or I've misconfigured something around the `redirectUris` set in `_utils.js::getClient()`. When using the /app/ oauth flow the first redirectUri listed must be `http://localhost:4000`, while `https://localhost:3000/auth_flow` must be first in the list when triggering the flow from a local airbyte webapp.

### Auth

Endpoints for oauth, making use of shared utility functions in _\_utils.js_ to implement the oauth flow.

Client IDs and Secrets are "managed" in _\_utils.js_. Right now it's hard coded in a few places to respect `{ clientId: 'chandler', clientSecret: 'prall' }`

Issued, non-revoked access/refresh tokens and authorization codes are stored in _data.json_.
