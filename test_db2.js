const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgres://mtc_user:ALKHAL3297@62.77.156.58:5432/mtc_db"
  });
  await client.connect();
  const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'messages'`);
  console.log('COLUMNS:', res.rows.map(r => r.column_name).join(', '));
  await client.end();
}
run();
