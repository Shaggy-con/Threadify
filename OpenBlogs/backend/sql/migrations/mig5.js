// RUN THIS INDEPENDENTLY
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log("Connected to database, running mig5...");

  try {
    // Create shared table (if it doesn't exist)
    await connection.query(`
            CREATE TABLE IF NOT EXISTS shared (
                user_id INT NOT NULL,
                blog_id int not null,
                sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                primary key(user_id,blog_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (blog_id) REFERENCES blogs(id)
            )
        `);
    console.log("✅ Created/verified shared table");

    // Check if collabblogs table exists and if content column needs to be converted
    const [tables] = await connection.query("SHOW TABLES LIKE 'collabblogs'");
    if (tables.length === 0) {
      console.log(
        "⚠️ collabblogs table does not exist, skipping column conversion"
      );
      return;
    }

    // Check if content column exists and what type it is
    const [columns] = await connection.query("DESCRIBE collabblogs");
    const contentColumn = columns.find((col) => col.Field === "content");

    if (!contentColumn) {
      console.log(
        "⚠️ content column does not exist in collabblogs, skipping conversion"
      );
      return;
    }

    if (contentColumn.Type.toLowerCase().includes("json")) {
      console.log(
        "✅ content column is already JSON type, skipping conversion"
      );
      return;
    }

    // Step 1: Add new JSON column if it doesn't exist
    const contentColumn1 = columns.find((col) => col.Field === "content1");
    if (!contentColumn1) {
      await connection.query(`ALTER TABLE collabblogs ADD content1 JSON`);
      console.log("✅ Added content1 JSON column");
    } else {
      console.log("✅ content1 column already exists");
    }

    // Step 2: Copy data from old column to new column (only if content1 is empty)
    const [rowCount] = await connection.query(
      `SELECT COUNT(*) as count FROM collabblogs WHERE content1 IS NOT NULL`
    );
    if (rowCount[0].count === 0) {
      await connection.query(
        `UPDATE collabblogs SET content1 = JSON_QUOTE(content) WHERE content IS NOT NULL`
      );
      console.log("✅ Copied data to content1 column");
    } else {
      console.log("✅ Data already exists in content1 column");
    }

    // Step 3: Drop old column
    if (contentColumn) {
      await connection.query(`ALTER TABLE collabblogs DROP COLUMN content`);
      console.log("✅ Dropped old content column");
    }

    // Step 4: Rename new column to old name
    await connection.query(
      `ALTER TABLE collabblogs RENAME COLUMN content1 TO content`
    );
    console.log("✅ Renamed content1 to content");

    console.log("🎉 Migration 5 completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    await connection.end();
    console.log("Database connection closed");
  }
}

// Run the migration
runMigration().catch(console.error);
