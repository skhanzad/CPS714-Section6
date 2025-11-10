"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  /*
  * This function calls logout api and deletes token, pushing user back to log in page.
  */
  async function handleLogout() {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login"); // redirect to login page
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  }

  //Returns button, can be edited to remove/change CSS
  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md"
    >
      Log Out
    </button>
  );
}
