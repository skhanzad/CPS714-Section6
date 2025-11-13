"use client";
import Link from "next/link";

function redirectLogin() {
  window.location.href = "/login";
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
       
       <div className="w-full flex-col text-center text-3xl font-bold">
        <h1 className="block p-4">CampusConnect</h1>
        
        {/* Main Login Button */}
        <button 
          className="mt-4 p-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          onClick={redirectLogin}
        >
          Login
        </button>

        {/* DEV ACCESS BUTTONS */}
        <div className="mt-8 p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Developer Access</h2>
          
          <div className="space-y-3">
            <Link 
              href="/organizer/events" 
              className="block w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition text-center"
            >
              Event Management
            </Link>
            <Link 
              href="/organizer/analytics" 
              className="block w-full bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 transition text-center"
            >
              Organizer Analytics & Reporting Dashboard
            </Link>
          </div>
        </div>
       </div>
      
      </main>
    </div>
  );
}