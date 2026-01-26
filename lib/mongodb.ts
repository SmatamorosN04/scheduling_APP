import {MongoClient} from "mongodb";

const url = process.env.MONGODB_URI;
const options = {};

if(!process.env.MONGODB_URI){
    throw new Error("se ingreso mal la URI")
}

const client = new MongoClient(url!, options)
 const clientPromise: Promise<MongoClient> = client.connect();

export default clientPromise