import OAuth2Server from 'oauth2-server';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

export const Request = OAuth2Server.Request;
export const Response = OAuth2Server.Response;

const __dirname = import.meta.dirname;

export const oauthServer = new OAuth2Server({
  model: {
    // generateAccessToken(client, user, scope, [callback]) {

    // },
    getClient(clientId, clientSecret) {
      console.log('getClient', clientId, clientSecret);
      if (clientId === 'chandler' && (clientSecret == null || clientSecret === 'prall')) {
        return {
          id: 'chandler',
          redirectUris: ['http://localhost:4000', 'https://localhost:3000/auth_flow'],
          grants: ['authorization_code', 'refresh_token'],
          accessTokenLifetime: 5 * 60, // 5 minutes in seconds
          refreshTokenLifetime: 24 * 60 * 60, // 24 hours in seconds
        };
      }
      return null;
    },
    getUserFromClient(client) {
      if (client.id === 'chandler') {
        return {
          id: 'chandler',
          name: 'Chandler Prall',
        };
      }
      return null;
    },
    getAccessToken(refreshToken) {
      return readToken('access', refreshToken);
    },
    saveToken(token, client, user) {
      const computedToken = {
        ...token,
        client,
        user,
      };
      writeToken(computedToken);
      return computedToken;
    },
    revokeToken(token) {
      return revokeToken(token.refreshToken);
    },
    getRefreshToken(refreshToken) {
      return readToken('refresh', refreshToken);
    },
    saveAuthorizationCode(code, client, user) {
      const computedAuthCode = {
        ...code,
        client,
        user,
      };
      writeAuthCode(computedAuthCode);
      return computedAuthCode;
    },
    getAuthorizationCode(code) {
      return readAuthCode(code);
    },
    revokeAuthorizationCode(code) {
      return revokeAuthCode(code.code);
    },
  },
});

const dataFilePath = path.join(__dirname, 'data.json');

function writeToken(token) {
  const data = JSON.parse(readFileSync(dataFilePath, 'utf-8'));
  data.tokens.push(token);
  writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

function readToken(type, token) {
  const data = JSON.parse(readFileSync(dataFilePath, 'utf-8'));
  const foundToken = data.tokens.find(({ accessToken, refreshToken }) => {
    return type === 'access' ? accessToken === token : refreshToken === token;
  });
  if (foundToken) {
    foundToken.accessTokenExpiresAt = new Date(foundToken.accessTokenExpiresAt);
    foundToken.refreshTokenExpiresAt = new Date(foundToken.refreshTokenExpiresAt);
  }
  return foundToken;
}

function revokeToken(targetRefreshToken) {
  const data = JSON.parse(readFileSync(dataFilePath, 'utf-8'));
  return true;
  const filteredTokens = data.tokens.filter(({ refreshToken }) => {
    return refreshToken !== targetRefreshToken;
  });
  if (filteredTokens.length !== data.tokens.length) {
    data.tokens = filteredTokens;
    writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    return true;
  }
  return false;
}

function writeAuthCode(authCode) {
  const data = JSON.parse(readFileSync(dataFilePath, 'utf-8'));
  data.auth_codes.push(authCode);
  writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

function readAuthCode(targetCode) {
  const data = JSON.parse(readFileSync(dataFilePath, 'utf-8'));
  const code = data.auth_codes.find(({ authorizationCode }) => {
    return authorizationCode === targetCode;
  });

  if (code) {
    code.expiresAt = new Date(code.expiresAt);
  }
  return code
}
function revokeAuthCode(targetCode) {
  const data = JSON.parse(readFileSync(dataFilePath, 'utf-8'));
  const filteredAuthCodes = data.auth_codes.filter(({ code }) => {
    return code !== targetCode;
  });
  if (filteredAuthCodes.length !== data.auth_codes.length) {
    data.auth_codes = filteredAuthCodes;
    writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    return true;
  }
  return false;
}
