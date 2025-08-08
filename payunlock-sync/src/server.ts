import express, {Request, Response} from 'express';
import cors from 'cors';
import uploadToBunnyRouter from './upload-to-bunny';

// Track when the server started
const startTime = new Date();

function safeJsonResponse(res: Response, body: any) {
  const safe = JSON.stringify(body, (_key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
  res.setHeader('Content-Type', 'application/json');
  res.send(safe);
}

/**
 * Configure and start the Express server
 * @param port - The port to listen on
 * @returns A promise that resolves to the actual port the server is listening on
 */
export async function startServer(port: number): Promise<number> {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint with detailed cache information
  app.get('/', async (_req: Request, res: Response) => {
    res.send('OK');
  });

  app.use('/api/cdn', uploadToBunnyRouter);

  // Start the server
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : port;
      resolve(actualPort);
    });
  });
}
