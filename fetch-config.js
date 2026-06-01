// Quick script to fetch Supabase config from server
fetch('https://qgdkcfbbsvzuqttrghlz.supabase.co/functions/v1/make-server-b11e7096/config')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error('Error:', e.message));
