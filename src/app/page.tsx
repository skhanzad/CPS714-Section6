"use client";
function redirectLogin() {
  window.location.href = "/login";
}
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
       
       <div  className="w-full flex-col text-center text-3xl font-bold">
        <h1 className="block p-4">Hello</h1>
        <button className="mt-4 p-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition" onClick={redirectLogin}>Login</button>
       </div>
      
      </main>
    </div>
  );
}
