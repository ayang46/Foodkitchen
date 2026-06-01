import { useState, useEffect } from 'react';

interface SupabaseConfig {
  projectId: string;
  publicAnonKey: string;
}

let configCache: SupabaseConfig | null = null;
let configPromise: Promise<SupabaseConfig> | null = null;

const fetchConfig = async (): Promise<SupabaseConfig> => {
  if (configCache) return configCache;

  if (!configPromise) {
    configPromise = fetch(
      'https://qgdkcfbbsvzuqttrghlz.supabase.co/functions/v1/make-server-b11e7096/config'
    )
      .then(res => res.json())
      .then(data => {
        configCache = data;
        return data;
      })
      .catch(error => {
        console.error('Failed to fetch Supabase config:', error);
        // Fallback
        const fallback = {
          projectId: 'qgdkcfbbsvzuqttrghlz',
          publicAnonKey: '',
        };
        configCache = fallback;
        return fallback;
      });
  }

  return configPromise;
};

export const useSupabaseConfig = () => {
  const [config, setConfig] = useState<SupabaseConfig | null>(configCache);
  const [loading, setLoading] = useState(!configCache);

  useEffect(() => {
    if (!configCache) {
      fetchConfig().then(data => {
        setConfig(data);
        setLoading(false);
      });
    }
  }, []);

  return { config, loading };
};

export const getSupabaseConfig = fetchConfig;
