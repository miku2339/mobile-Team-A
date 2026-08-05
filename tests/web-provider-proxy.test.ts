import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import test from 'node:test';

import { createWebProviderProxyServer } from '../server/web-provider-proxy';

async function listen(server: Server): Promise<number> {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test port');
  return address.port;
}

async function close(server: Server): Promise<void> {
  server.close();
  await once(server, 'close');
}

test('local Web proxy answers CORS and forwards an allowlisted request without storing the key', async () => {
  let receivedAuthorization = '';
  let receivedBody = '';
  const upstream = createServer((request, response) => {
    receivedAuthorization = String(request.headers.authorization ?? '');
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      receivedBody += chunk;
    });
    request.on('end', () => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(
        JSON.stringify({
          model: 'test-model-served',
          choices: [
            { finish_reason: 'stop', message: { content: 'Proxy reply' } }
          ]
        })
      );
    });
  });

  const upstreamPort = await listen(upstream);
  const proxy = createWebProviderProxyServer({
    allowedOrigins: ['http://127.0.0.1:8082']
  });
  const proxyPort = await listen(proxy);

  try {
    const preflight = await fetch(
      `http://127.0.0.1:${proxyPort}/v1/chat/completions`,
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://127.0.0.1:8082',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers':
            'authorization,content-type,x-melo-provider-id,x-melo-upstream-base-url'
        }
      }
    );
    assert.equal(preflight.status, 204);
    assert.equal(
      preflight.headers.get('Access-Control-Allow-Origin'),
      'http://127.0.0.1:8082'
    );

    const response = await fetch(
      `http://127.0.0.1:${proxyPort}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          Origin: 'http://127.0.0.1:8082',
          Authorization: 'Bearer test-secret',
          'Content-Type': 'application/json',
          'X-Melo-Provider-Id': 'custom',
          'X-Melo-Upstream-Base-Url': `http://127.0.0.1:${upstreamPort}/v1`
        },
        body: JSON.stringify({
          model: 'test-model',
          messages: [{ role: 'user', content: 'Hello' }],
          stream: false
        })
      }
    );

    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('Access-Control-Allow-Origin'),
      'http://127.0.0.1:8082'
    );
    assert.equal(receivedAuthorization, 'Bearer test-secret');
    assert.deepEqual(JSON.parse(receivedBody), {
      model: 'test-model',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false
    });
    assert.equal((await response.json()).model, 'test-model-served');
  } finally {
    await close(proxy);
    await close(upstream);
  }
});
