export default async ({ ctx, send, params }) => {
  ctx.response.type = 'application/json'

  const response = await fetch('http://localhost:4000/auth/token', {
    method: 'POST',
    'Content-Type': 'application/x-www-form-urlencoded',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: params.client_id,
      [params.client_secret ? 'client_secret' : undefined]: params.client_secret,
      redirect_uri: params.redirect_url,
      code: params.code,
    }),
  })

  const responseText = await response.text()
  const responseJson = JSON.parse(responseText)

  responseJson.refresh_token = responseJson.refreshToken

  console.log(JSON.stringify(responseJson, null, 2))

  send(`
  ${JSON.stringify(responseJson, null, 2)}
  `)
}