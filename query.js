const fs = require('fs');
const { Client } = require('pg');
const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.split('\n').find(line => line.startsWith('DATABASE_URL=')).split('=')[1];
async function run() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables:', res.rows.map(r => r.table_name));
  await client.end();
}
run();
