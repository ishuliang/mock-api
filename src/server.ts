import { createServer } from 'node:http';

import './db/database.ts';
import { port } from './config.ts';
import { HttpError } from './errors.ts';
import { routeRequest } from './http/router.ts';
import { sendJson } from './http/response.ts';

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, null);
      return;
    }

    await routeRequest(req, res);
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.status, { error: error.message });
      return;
    }

    console.error(error);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(port, () => {
  console.log(`Personal Mock API running at http://localhost:${port}`);
  console.log(`Mock endpoint prefix: http://localhost:${port}/mock/*`);
});
