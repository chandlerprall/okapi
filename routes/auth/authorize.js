import { oauthServer, Request, Response } from './_utils.js';

export default async ({ ctx, send, params }) => {
  if (params.response_type !== 'code') {
    ctx.response.type = 'text/plain'
    ctx.status = 400
    send('Invalid response_type parameter')
    return;
  }


  const authorizeResponse = await oauthServer.authorize(
    new Request(ctx.request),
    new Response(ctx.response),
    {
      authorizationCodeLifetime: 60, // 60 seconds
      authenticateHandler: {
        handle() {
          return { user: 'chndlr' };
        }
      }
    }
  )

  ctx.response.type = 'text/html'

  send(`
<!DOCTYPE html>
<html>

<head>
  <title>OAuth 2.0 Server authorization</title>
</head>

<body>
  <h1>Authorize Application</h1>

  Application <strong>${params.client_id}</strong> is requesting permission to access your account.
  <br/><br/>
  (will redirect to ${params.redirect_url})
  <form method="GET" action="${params.redirect_url}">
    <input type="hidden" name="state" value="${params.state}" />
    <input type="hidden" name="code" value="${authorizeResponse.authorizationCode}" />
    <input type="submit" value="Authorize" />
  </form>
</body>

</html>    
  `);
}