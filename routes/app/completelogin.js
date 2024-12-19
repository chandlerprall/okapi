export default async ({ ctx, send, params }) => {
  ctx.response.type = 'application/json'

  const response = await fetch('http://localhost:4000/auth/token', {
    method: 'POST',
    'Content-Type': 'application/x-www-form-urlencoded',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'chandler',
      redirect_uri: 'http://localhost:4000',
      code: params.code,
    }),
  })

  const responseText = await response.text()
  const responseJson = JSON.parse(responseText)
  const { accessToken, refreshToken } = responseJson
  ctx.cookies.set('access_token', accessToken, { httpOnly: false })
  ctx.cookies.set('refresh_token', refreshToken, { httpOnly: false })

  send(`
  ${JSON.stringify(responseJson, null, 2)}
  `)
}