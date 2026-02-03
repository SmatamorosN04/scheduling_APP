import {MongoClient} from "mongodb";

const url = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
const options = {};

if(!process.env.MONGODB_URI){
    throw new Error("se ingreso mal la URI")
}

const client = new MongoClient(url!, options)
 const clientPromise: Promise<MongoClient> = client.connect();

export default clientPromise

export async function connectToDatabase() {
    const client = await clientPromise;
    const db = client.db(dbName || "scheduling_App");

    try {
        await db.collection('verification_codes').createIndex(
            {"expiresAt": 1},
            { expireAfterSeconds: 0}
        )
    }catch (e) {
        console.error("Error al asegurar el índice TTL:", e);
    }

    return { client, db };
}

