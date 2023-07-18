import { IUserJob } from '@user/interfaces/user.interface';
import { userWorker } from '@worker/user.worker';
import { BaseQueue } from './base.queue';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
  }
  public addUserJob(name: string, data: IUserJob) {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
