import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';  
import { BackupService } from './backup.service';

@Injectable()
export class BackupSchedulerService implements OnModuleInit {
  constructor(private readonly backupService: BackupService) {}

  onModuleInit() {
    this.startBackupJob();
  }

  startBackupJob() {
    cron.schedule('0 0 * * *', () => {
      console.log('Starting MongoDB backup...');
      this.backupService.backupDatabase();  
    });
  }
}
 