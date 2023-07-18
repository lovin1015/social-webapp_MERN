import express, { Express } from 'express';
import { config } from './config';
import setupDatabase from './setupDatabase';
import { ChattyServer } from './setupServer';

class Application {
  public initialize(): void {
    this.loadConfig();
    setupDatabase();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const app: Application = new Application();

app.initialize();
