const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.qjfwcyvylflmyowuotlz',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZndjeXZ5bGZsbXlvd3VvdGx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ0MDQ0OSwiZXhwIjoyMDk2MDE2NDQ5fQ.prY1zH-Ojik7G6ejHmAkTMzZplUli5UTIMV1pKg1Y1I',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('Connected to Supabase PostgreSQL!');
    return client.query(`
      GRANT ALL ON servicios_criticos TO anon, service_role;
      GRANT ALL ON kpis TO anon, service_role;
      GRANT ALL ON penalizaciones TO anon, service_role;
      GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, service_role;
      NOTIFY pgrst, 'reload schema';
    `);
  })
  .then((res) => {
    console.log('Grants applied successfully');
    return client.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    client.end();
  });
