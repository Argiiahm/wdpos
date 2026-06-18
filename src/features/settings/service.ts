import { supabase } from "../../lib/supabase/client";

// Checks if the database table settings exists and is accessible
export async function isSupabaseSettingsAvailable(): Promise<boolean> {
  try {
    const { error } = await supabase.from("settings").select("key").limit(1);
    if (error && (error.code === "PGRST205" || error.message.includes("does not exist"))) {
      return false;
    }
    return !error;
  } catch {
    return false;
  }
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      // Fallback to localStorage on table missing or fetch failure
      if (error.code === "PGRST205" || error.message.includes("does not exist")) {
        return localStorage.getItem(key);
      }
      throw error;
    }
    return data ? data.value : null;
  } catch {
    return localStorage.getItem(key);
  }
}

export async function saveSetting(key: string, value: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("settings")
      .upsert({ key, value })
      .eq("key", key);

    if (error) {
      if (error.code === "PGRST205" || error.message.includes("does not exist")) {
        localStorage.setItem(key, value);
        return;
      }
      throw error;
    }
  } catch {
    localStorage.setItem(key, value);
  }
}

export async function deleteSetting(key: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("settings")
      .delete()
      .eq("key", key);

    if (error) {
      if (error.code === "PGRST205" || error.message.includes("does not exist")) {
        localStorage.removeItem(key);
        return;
      }
      throw error;
    }
  } catch {
    localStorage.removeItem(key);
  }
}
