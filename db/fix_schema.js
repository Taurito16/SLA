const { Client } = require('pg');

async function fixSchema() {
  // Try connection pooler with service_role JWT as password
  const configs = [
    {
      host: 'aws-0-us-west-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.qjfwcyvylflmyowuotlz',
      password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZndjeXZ5bGZsbXlvd3VvdGx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ0MDQ0OSwiZXhwIjoyMDk2MDE2NDQ5fQ.prY1zH-Ojik7G6ejHmAkTMzZplUli5UTIMV1pKg1Y1I',
      ssl: { rejectUnauthorized: false }
    }
  ];

  for (const config of configs) {
    console.log(`Trying connection to ${config.host}:${config.port} as ${config.user}...`);
    const client = new Client(config);
    try {
      await client.connect();
      console.log('Connected! Running fix SQL...');
      
      await client.query(`
        GRANT ALL ON public.servicios_criticos TO anon, service_role;
        GRANT ALL ON public.kpis TO anon, service_role;
        GRANT ALL ON public.penalizaciones TO anon, service_role;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, service_role;
        NOTIFY pgrst, 'reload schema';
      `);
      
      console.log('Schema refreshed successfully!');
      await client.end();
      return true;
    } catch (err) {
      console.log(`Failed: ${err.message}`);
      try { await client.end(); } catch(e) {}
    }
  }
  
  console.log('Could not connect. Please go to Supabase Dashboard > SQL Editor and run the schema.sql file.');
  return false;
}

fixSchema().then(success => {
  if (!success) process.exit(1);
});
