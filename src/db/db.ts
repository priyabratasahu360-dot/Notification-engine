import mongoose from "mongoose"
import "dotenv/config";

const url = process.env.MONGO_URI || "";

export const connectDb = async() => {
    try{
        await mongoose.connect(url);
        console.log("Mongodb connected");
    }
    catch(error){
        console.log("Error connecting to mongodb", error);
    }
}