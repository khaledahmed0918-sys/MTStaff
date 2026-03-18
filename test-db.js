const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables:', res.rows.map(r => r.table_name));
  const res2 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'channels'");
  console.log('Channels columns:', res2.rows);
  await client.end();
}
run();
