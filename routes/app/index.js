export default async ({ ctx, send }) => {
  ctx.response.type = 'text/html'

  send(`
<!DOCTYPE html>
<html>

<head>
  <title>MyApp</title>
</head>

<body>
  <button id="login">Login</button>
  <button id="verify">Verify</button>
  <button id="refresh">Refresh</button>
  <script>
    document.getElementById('login').addEventListener('click', async () => {
      const stateValues = new Uint8Array(16);
      crypto.getRandomValues(stateValues);
      const client_id = 'chandler'
      const state = btoa([...stateValues].map(x => String.fromCharCode(x)).join(''))
      const redirectUrl = "http://localhost:4000/app/completelogin"

      window.location = \`/auth/authorize?response_type=code&state=\${state}&client_id=\${client_id}&redirect_url=\${encodeURIComponent(redirectUrl)}\`;
    });

    document.getElementById('verify').addEventListener('click', async () => {
      // read "access_token" and "refresh_token" cookies
      const cookies = document.cookie.split(';').map(x => x.trim()).reduce((acc, x) => {
        const [key, value] = x.split('=')
        acc[key] = value
        return acc
      }, {})
      const { access_token, refresh_token } = cookies;

      let response = await fetch('http://localhost:4000/auth/verify', {
        method: 'POST',
        headers: {
          authorization: \`Bearer \${access_token}\`,
        }
      });

      if (response.status === 401) {
        console.log('retrying with refresh token')
        await refreshToken();

        const cookies = document.cookie.split(';').map(x => x.trim()).reduce((acc, x) => {
          const [key, value] = x.split('=')
          acc[key] = value
          return acc
        }, {})
        const { access_token, refresh_token } = cookies;

        response = await fetch('http://localhost:4000/auth/verify', {
          method: 'POST',
          headers: {
            authorization: \`Bearer \${access_token}\`,
          }
        });
      }

      const responseText = await response.text()
      console.log(responseText)
    });

    document.getElementById('refresh').addEventListener('click', async () => {
      refreshToken();
    });

    async function refreshToken() {
      // read "access_token" and "refresh_token" cookies
      const cookies = document.cookie.split(';').map(x => x.trim()).reduce((acc, x) => {
        const [key, value] = x.split('=')
        acc[key] = value
        return acc
      }, {})
      const { access_token, refresh_token } = cookies;

      const response = await fetch('http://localhost:4000/auth/token', {
        method: 'POST',
        'Content-Type': 'application/x-www-form-urlencoded',
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: 'chandler',
          refresh_token: refresh_token,
          redirect_uri: 'http://localhost:4000',
        }),
      });

      const responseText = await response.text()
      console.log(responseText)
    }
  </script>
</body>

</html>
  `)
}