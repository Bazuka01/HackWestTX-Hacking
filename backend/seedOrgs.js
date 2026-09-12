// seedOrgs.js
// npm install pg dotenv
// Run once with: node seedOrgs.js

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// TigerData gives you a standard Postgres connection string from your
// service dashboard — put it in a .env file, don't hardcode it.
// e.g. DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
require("dotenv").config();

async function seedOrgs() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const raw = fs.readFileSync(path.join(__dirname, "orgs.json"), "utf-8");
  const orgs = JSON.parse(raw);

  for (const org of orgs) {
    await client.query(
      `INSERT INTO orgs (id, name, category, interest_tags, hobby_tags, culture_tag, contact, meeting_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         interest_tags = EXCLUDED.interest_tags,
         hobby_tags = EXCLUDED.hobby_tags`,
      [
        org.id,
        org.name,
        org.category,
        org.interestTags || [],
        org.hobbyTags || [],
        org.cultureTag,
        org.contact,
        org.meetingTime,
      ]
    );
    console.log(`Inserted: ${org.name}`);
  }

  console.log(`Done — seeded ${orgs.length} orgs.`);
  await client.end();
}

seedOrgs().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
