const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/E-Learning-Platform',  // MongoDB URI aw e3mloha el local
  backupPath: process.env.BACKUP_PATH || './src/backup/backups',  
};

export default config;
