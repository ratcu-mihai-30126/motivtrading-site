import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://duinpadqwekrpdcyjvpb.supabase.co";
const supabaseAnonKey = "sb_publishable_XSPUVGf9Pf4aFKEHoJuFog_f3oAErtr";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
