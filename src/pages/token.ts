import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

export const prerender = false;
export async function POST({ request }: { request: Request }): Promise<Response> {
  try {
    // Parse the request body as JSON
    const body = await request.json();
    const {
      connectedAppClientId,
      tableauUser ,
      connectedAppClientSecret,
      connectedAppSecretId,
      ...restAttributes
    } = body;

    const payload = {
      'iss': connectedAppClientId,
      'exp': Math.floor(Date.now() / 1000) + 60 * 10,
      'jti': uuid(),
      'aud': 'tableau',
      'sub': tableauUser,
      "scp": ["tableau:views:embed", "tableau:metrics:embed"],
      ...restAttributes,
    };

    const token = jwt.sign(
      payload, 
      connectedAppClientSecret,
      {
        header: {
          typ: 'JWT',
          alg: 'HS256',
          kid: connectedAppSecretId,
        },
      }
    );

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}