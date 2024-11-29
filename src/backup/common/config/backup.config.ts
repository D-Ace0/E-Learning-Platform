const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/elearning',  // MongoDB URI
  backupPath: process.env.BACKUP_PATH || './src/backup/backups',  
};

export default config;
