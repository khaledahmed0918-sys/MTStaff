import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgres://mtc_user:ALKHAL3297@62.77.156.58:5432/mtc_db"
  });
  await client.connect();
  const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
  console.log(res.rows.map(r => r.table_name).join(', '));
  
  const res2 = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'messages'`);
  console.log('messages columns:', res2.rows.map(r => r.column_name).join(', '));

  const res3 = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'channels%'`);
  console.log('channel tables:', res3.rows.map(r => r.table_name).join(', '));

  await client.end();
}
run();
