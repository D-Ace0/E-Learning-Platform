import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import config from '../backup/common/config/backup.config';  

@Injectable()
export class BackupService {

  async backupDatabase() {
    const backupFile = `backup-${new Date().toISOString().split('T')[0]}.gz`;  
    const backupPath = path.join(config.backupPath, backupFile); 
    
    
    const command = `mongodump --uri=${config.mongoUri} --archive=${backupPath} --gzip`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during backup: ${stderr}`);
        return;
      }
      console.log(`Backup completed: ${stdout}`);
    });
  }
}
