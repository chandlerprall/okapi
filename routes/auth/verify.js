// import UnauthorizedRequestError from 'oauth2-server/lib/errors/unauthorized-request-error.js'
import InvalidTokenError from 'oauth2-server/lib/errors/invalid-token-error.js'
import InvalidGrantError from 'oauth2-server/lib/errors/invalid-grant-error.js'
import { oauthServer, Request, Response } from './_utils.js';

export default async ({ ctx, send }) => {
  try {
    const token = await oauthServer.authenticate(new Request(ctx.request), new Response(ctx.response))
    send(JSON.stringify(token, null, 2))
  } catch (e) {
    ctx.response.status = 401
    if (e instanceof InvalidTokenError || e instanceof InvalidGrantError) {
      ctx.response.type = 'text/plain'
      send('Unauthorized\n')
      send(e.stack)
    } else {
      console.log(e)
      ctx.response.type = 'text/plain'
      send(e.stack)
    }
  }
}