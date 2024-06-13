import jwksClient, { JwksClient, type SigningKey } from 'jwks-rsa';
import jwt, {
  type JwtHeader,
  type JwtPayload,
  type SigningKeyCallback,
} from 'jsonwebtoken';

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

const validateIDTokenSignature = async (
  idToken: string,
): Promise<JwtPayload> => {
  const jwksUrl = 'https://www.googleapis.com/oauth2/v3/certs';

  // create a jwks client
  const client: JwksClient = jwksClient({
    jwksUri: jwksUrl.toString(),
  });

  const getKey = (header: JwtHeader, callback: SigningKeyCallback) => {
    client.getSigningKey(header.kid, (err: Error | null, key?: SigningKey) => {
      const signingKey = key?.getPublicKey() || key?.getPublicKey();
      callback(err, signingKey);
    });
  };

  return new Promise((resolve, reject) => {
    jwt.verify(idToken, getKey, (err, decoded) => {
      if (err) {
        reject(err);
      }
      resolve(decoded as JwtPayload);
    });
  });
};

export const getIDTokenIssuerOptions = (): string[] => {
  return 'https://accounts.google.com,accounts.google.com'.split(',');
};

export const verifyIDToken = async (idToken: string): Promise<JwtPayload> => {
  // validate the signature
  const payload = await validateIDTokenSignature(idToken);

  // verify the issuer claim
  const idTokenIssuerOptions = getIDTokenIssuerOptions();
  if (!idTokenIssuerOptions.includes(payload?.iss ?? '')) {
    throw new Error('Invalid ID token issuer');
  }

  // verify the audience claim
  if (
    payload.aud !==
    '879077169026-c59e4euiha84cjgbav67nl8fq29nbjs4.apps.googleusercontent.com'
  ) {
    throw new Error('Invalid ID token audience');
  }

  // verify the expiration time
  if ((payload?.exp ?? 0) < Math.floor(Date.now() / 1000)) {
    throw new Error('ID token expired');
  }

  return payload;
};

export const exchangeCodeWithTokens = async (
  code: string,
): Promise<TokenResponse> => {
  // discover the google token endpoint
  const googleTokenEndpoint = 'https://oauth2.googleapis.com/token';
  // prepare the request body data to suite application/x-www-form-urlencoded
  const requestBody = new URLSearchParams();
  // append the required data
  requestBody.append('code', code);
  requestBody.append(
    'client_id',
    '879077169026-c59e4euiha84cjgbav67nl8fq29nbjs4.apps.googleusercontent.com',
  );
  requestBody.append('client_secret', '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');
  requestBody.append(
    'redirect_uri',
    'http://localhost:5173/api/auth/google/callback',
  );
  requestBody.append('grant_type', 'authorization_code');

  const tokenRequest = await fetch(googleTokenEndpoint.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestBody,
  });

  if (!tokenRequest.ok) {
    throw new Error('Failed to exchange code with tokens');
  }

  return await tokenRequest.json();
};
