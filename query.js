const fs = require('fs');
const { Client } = require('pg');
const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.split('\n').find(line => line.startsWith('DATABASE_URL=')).split('=')[1];
async function run() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  const res = await client.query("SELECT COUNT(DISTINCT user_id) FROM messages");
  console.log('Users:', res.rows[0].count);
  await client.end();
}
run();
