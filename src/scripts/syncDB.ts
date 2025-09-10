import "dotenv/config";
import { execSync } from "child_process";
import path from "path";
import process from "process";

const REMOTE_URI = process.env.REMOTE_MONGO_URI;
const LOCAL_URI = process.env.DATABASE_URI;
const DUMP_DIR = path.resolve(process.cwd(), "dump");

if (!REMOTE_URI || !LOCAL_URI) {
  console.error("❌ Missing REMOTE_MONGO_URI or LOCAL_MONGO_URI in environment variables");
  process.exit(1);
}

const DB_NAME = new URL(LOCAL_URI).pathname.replace(/^\//, '');


try {
  console.log("📤 Dumping 'All' database from remote...");
  execSync(`mongodump --uri="${REMOTE_URI}" --out="${DUMP_DIR}"`, { stdio: "inherit" });

  console.log(`🗑 Dropping local ${DB_NAME} database...`);
  execSync(`mongosh "${LOCAL_URI}" --eval "db.dropDatabase()"`, { stdio: "inherit" });

  console.log(`📥 Restoring ${DB_NAME} database to local...`);
  execSync(`mongorestore --uri="${LOCAL_URI}" "${DUMP_DIR}/${DB_NAME}"`, { stdio: "inherit" });

  console.log("🧹 Cleaning up dump folder...");
  if (process.platform === "win32") {
    execSync(`rmdir /s /q "${DUMP_DIR}"`, { stdio: "inherit" }); // Windows
  } else {
    execSync(`rm -rf "${DUMP_DIR}"`, { stdio: "inherit" }); // Mac/Linux
  }

  console.log(`✅ Done — ${DB_NAME} database synced from remote to local.`);
} catch (err) {
  console.error("❌ Error:", err);
  process.exit(1);
}