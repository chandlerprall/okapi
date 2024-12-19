import { oauthServer, Request, Response } from './_utils.js';

export default async ({ ctx, send }) => {
  const token = await oauthServer.token(
    new Request(ctx.request),
    new Response(ctx.response),
    {
      requireClientAuthentication: {
        authorization_code: false,
        refresh_token: false,
      },
    }
  )

  ctx.cookies.set('access_token', token.accessToken, { httpOnly: false })
  ctx.cookies.set('refresh_token', token.refreshToken, { httpOnly: false })


  // token.access_token = token.accessToken
  token.refresh_token = token.refreshToken
  // token.expires_in = 60 * 60; // 1 hour
  token.expires_in = Math.floor(new Date(token.accessTokenExpiresAt).valueOf() / 1000) - Math.floor(new Date().valueOf() / 1000)

  // console.log('-----')
  // console.log('token response')
  // console.log(JSON.stringify(token, null, 2))
  // console.log('-----')

  send(JSON.stringify(token, null, 2))
}