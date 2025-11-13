'use client';

import { useState, useEffect } from 'react';
import Header from "../../../components/Header";

export default function AnalyticsPage() {
  // Get Dash app URL from environment variable, fallback to default
  const dashUrl = process.env.NEXT_PUBLIC_DASH_URL || 'http://localhost:8050';
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Set a timeout to detect if iframe doesn't load
  useEffect(() => {
    const timeout = setTimeout(() => {
      // If still loading after 8 seconds, assume connection error
      if (isLoading) {
        setIsLoading(false);
        setConnectionError(true);
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [dashUrl, isLoading]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setConnectionError(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header subtitle="Organizer Analytics & Reporting Dashboard" />
      <main className="w-full h-[calc(100vh-80px)] relative">
        {connectionError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white z-10">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Unable to Load Dashboard
              </h2>
              <p className="text-red-600 mb-4">
                The analytics dashboard server is not running or not accessible.
              </p>
              <div className="text-sm text-red-500 mb-4 space-y-2">
                <p><strong>To start the Dash app:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Make sure Docker is running: <code className="bg-red-100 px-1 rounded">docker compose up -d</code></li>
                  <li>Install Python dependencies: <code className="bg-red-100 px-1 rounded">pip install -r requirements.txt</code></li>
                  <li>Start the Dash app: <code className="bg-red-100 px-1 rounded">python app.py</code></li>
                </ol>
              </div>
              <code className="block bg-red-100 p-2 rounded text-sm mb-4 whitespace-pre-wrap font-mono">
                python app.py
              </code>
              <p className="text-xs text-gray-600 mb-4">
                The server should start at: <strong>{dashUrl}</strong>
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Note: The Dash app must be running in a separate terminal window.
              </p>
              <button
                onClick={() => {
                  setConnectionError(false);
                  setIsLoading(true);
                  window.location.reload();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        {isLoading && !connectionError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-5">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        )}
        <iframe
          src={dashUrl}
          className="w-full h-full border-0"
          title="Organizer Analytics & Reporting Dashboard"
          allowFullScreen
          onLoad={handleIframeLoad}
        />
      </main>
    </div>
  );
}

