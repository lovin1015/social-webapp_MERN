import { config } from '@root/config';
import { mailTransport } from '@service/emails/mail.transport';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('EmailWorker');

class EmailWorker {
  public async addNotificationEmail(job: Job, cb: DoneCallback): Promise<void> {
    try {
      const { template, recieverEmail, subject } = job.data;
      await mailTransport.sendEmail(recieverEmail, subject, template);
      job.progress(100);
      cb(null, job.data);
    } catch (error) {
      log.error(error);
      cb(error as Error);
    }
  }
}
export const emailWorker: EmailWorker = new EmailWorker();
