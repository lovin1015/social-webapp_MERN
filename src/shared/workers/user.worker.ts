import { userService } from '@service/db/user.service';
import { DoneCallback, Job } from 'bull';

class UserWorker {
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await userService.addUserData(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
