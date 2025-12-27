
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbpoxlzuofvlalmemki.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YnBveGx6dW9mdmxhbG1lbWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODUzMjAsImV4cCI6MjA4MjM2MTMyMH0.LhKxEHLnexv0QtpPCzT2_Tkx_G219Hp_En4VrTdmyYM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
