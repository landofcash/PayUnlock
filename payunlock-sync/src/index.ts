import { startServer } from './server';
import { config } from './config';

async function main() {
  try {
    const port = await startServer(config.port);
    console.log(`🚀 PayUnlock Cache API running on port ${port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
