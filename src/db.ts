import { MongoClient } from "mongodb";
import env from "./env.js";
env();

const uri = `mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PASSWORD}@cluster0.rlp2b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
const dbName = process.env.MONGODB_DB_NAME;

await client.connect();
const db = client.db(dbName);

const data = db.collection("data");
const log = db.collection("log");

export {
  data,
  log,
};
