// Script to create Otp table in Turso database
import { createClient } from '@libsql/client';
import fs from 'fs';

const client = createClient({
  url: 'libsql://clinic-booking-hkumar0.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Mzc4MDM4ODUsImlkIjoiOTYwZDIzN2QtMTMzNi00NjdlLTg0NzUtOWE0OTA1YTVlODYwIn0.AWjN1BCrUZZRcQsYk9jk_c0w-uZK4LwX25FJK5-VvgaShXPLvxqcNJf4_nUvBDppFwG2ozw1y-a3-Bqf-B5wDA',
});

try {
  // First test connection with a simple query
  console.log('Testing connection...');
  const result = await client.execute('SELECT 1 as test');
  console.log('✅ Connection successful!', result);
  
  // Now create the table
  const sql = fs.readFileSync('./create_otp_table.sql', 'utf-8');
  await client.execute(sql);
  console.log('✅ Otp table created successfully!');
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
} finally {
  client.close();
}
