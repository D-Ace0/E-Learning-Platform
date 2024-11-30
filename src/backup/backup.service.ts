import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import config from '../backup/common/config/backup.config';

@Injectable()
export class BackupService {

  async backupDatabase() {
    const timestamp = this.formatDate(new Date());  
    const backupFile = `backup-${timestamp}.gz`;
    const backupPath = path.resolve('src', 'backup', 'backups', backupFile);  


    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });  
    }

  
    const command = `mongodump --uri=${config.mongoUri} --archive="${backupPath}" --gzip`;

    console.log(`Executing command: ${command}`);  

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during backup: ${stderr}`);
        return;
      }
      console.log(`Backup completed: ${stdout}`);
    });
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');  
    const month = String(date.getMonth() + 1).padStart(2, '0');  
    const year = date.getFullYear();  
    const hours = String(date.getHours()).padStart(2, '0');  
    const minutes = String(date.getMinutes()).padStart(2, '0');  
    const seconds = String(date.getSeconds()).padStart(2, '0');  

    return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
  }
}
