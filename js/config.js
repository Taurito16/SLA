/**
 * Configuración de Supabase
 * SLA - Comercializadora Global S.A.
 */

const SUPABASE_URL = 'https://qjfwcyvylflmyowuotlz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZndjeXZ5bGZsbXlvd3VvdGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDA0NDksImV4cCI6MjA5NjAxNjQ0OX0.6ofPNPNs-3-aEXonZRZd9dwJfTrl32V5kP8O39eezeg';

// Inicializar cliente Supabase (accesible globalmente)
window.__supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
