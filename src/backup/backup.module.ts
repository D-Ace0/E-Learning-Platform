import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupSchedulerService } from './backup-scheduler.service';
import { BackupController } from './backup.controller';

@Module({
  imports: [],
  providers: [BackupService, BackupSchedulerService],
  controllers: [BackupController],
})
export class BackupModule {}
