"use client";

export default function LeaderboardPage() {
  const leaderboardData = [
    { name: "Alice", points: 120 },
    { name: "Bob", points: 95 },
    { name: "Charlie", points: 80 },
    { name: "You", points: 70 },
  ];

  // This function handles logout and sends the user back to the login page
  const handleLogout = () => {
    // You can also clear tokens or localStorage here later if authentication is added
    window.location.href = "/login";
  };

  return (
    <main className="p-6 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <table className="border-collapse w-full max-w-md">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Rank</th>
            <th className="p-2">Name</th>
            <th className="p-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((user, index) => (
            <tr key={user.name} className="border-b hover:bg-gray-50">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
