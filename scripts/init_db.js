const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://postgres:vRFREnfEkDvCoIds@db.wbhhhtmuznhcfpujqvwu.supabase.co:5432/postgres';

async function main() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const res = await client.query("SELECT name, setting FROM pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%secret%';");
    console.log('JWT settings:', res.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
