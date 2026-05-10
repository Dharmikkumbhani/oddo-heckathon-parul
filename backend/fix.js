const db = require('./db');
db.query("UPDATE trips SET status = 'upcoming' WHERE status = 'draft'")
  .then(() => { console.log('Fixed trips'); process.exit(0); })
  .catch(console.error);
