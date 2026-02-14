import mongoose from "mongoose";

let isConnected = false;

export default async function startMongodb() {
  if (isConnected || mongoose.connection.readyState === 1) return;

  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI missing");

  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "airShare",
  });

  isConnected = conn.connections[0].readyState === 1;
}
