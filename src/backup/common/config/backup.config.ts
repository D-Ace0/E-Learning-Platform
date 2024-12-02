const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://Omar:Omar1234@omarbadrawy1.ceagv.mongodb.net/',  // MongoDB URI aw e3mloha el local
  backupPath: process.env.BACKUP_PATH || './src/backup/backups',  
};

export default config;
