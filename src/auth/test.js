import { Client } from "pg";

// Connection configuration
// Update these credentials for your setup
const client = new Client({
  host: "localhost",
  port: 5432,
  user: "root",
  password: "admin",
  database: "campus_connect_db",
});

// interface User {
//   id: number;
//   first_name: string;
//   middle_name: string | null;
//   last_name: string;
//   birthdate: string; // ISO date string
//   student_id: string;
//   password: string;
//   permission_level: number;
// }

async function main() {
  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    // --- 1️⃣ Insert a predefined user ---
    const newUser = {
      first_name: "Alice",
      middle_name: "B",
      last_name: "Doe",
      birthdate: "2000-05-22",
      student_id: "S10001",
      password: "password123", // academic only
      permission_level: 0,
    };

    await client.query(
      `
      INSERT INTO users (first_name, middle_name, last_name, birthdate, student_id, password, permission_level)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (student_id) DO NOTHING
      `,
      [
        newUser.first_name,
        newUser.middle_name,
        newUser.last_name,
        newUser.birthdate,
        newUser.student_id,
        newUser.password,
        newUser.permission_level,
      ]
    );
    console.log("👤 Inserted predefined user (or skipped if exists)");

    // --- 2️⃣ Retrieve and print all users ---
    const res = await client.query("SELECT * FROM users ORDER BY id;");
    console.log("📋 All users:");
    for (const user of res.rows) {
      console.log(
        `${user.id}: ${user.first_name} ${user.last_name} (student_id=${user.student_id})`
      );
    }
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.end();
    console.log("🔌 Disconnected");
  }
}

main();
