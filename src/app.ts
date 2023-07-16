import express, { Express } from 'express';
import { config } from './config';
import { ChattyServer } from './setupServer';

class Application {
  public initialize(): void {
    this.loadConfig();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
  }
}

const app: Application = new Application();

app.initialize();
