import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Database, CheckCircle, XCircle } from 'lucide-react';

function App() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('_test_connection').select('*').limit(1);

        if (error && error.code !== 'PGRST204' && error.code !== '42P01') {
          throw error;
        }

        setConnected(true);
      } catch (err) {
        console.error('Supabase connection error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setConnected(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
        <div className="flex items-center justify-center mb-6">
          <Database className="w-16 h-16 text-purple-400" />
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-4">
          Supabase Connection
        </h1>

        <div className="space-y-4">
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Status</span>
              {connected === null && (
                <span className="text-yellow-400 animate-pulse">Testing...</span>
              )}
              {connected === true && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Connected</span>
                </div>
              )}
              {connected === false && (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-5 h-5" />
                  <span>Failed</span>
                </div>
              )}
            </div>

            {connected === true && (
              <p className="text-sm text-gray-400">
                Successfully connected to Supabase project
              </p>
            )}

            {error && (
              <p className="text-sm text-red-300 mt-2">
                Error: {error}
              </p>
            )}
          </div>

          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-2">Project URL</h3>
            <p className="text-sm text-purple-300 break-all">
              {import.meta.env.VITE_SUPABASE_URL}
            </p>
          </div>

          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-2">Next Steps</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Create database tables</li>
              <li>Set up authentication</li>
              <li>Build your app features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
