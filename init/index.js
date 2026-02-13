const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("Connected to DB...!");
}).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});    //  sbse pehle already pde hue database ko clean kro 
    initdata.data = initdata.data.map((obj) => ({
        ...obj,
        owner: "697a45b55d790841d0249875",
    }));
    await Listing.insertMany(initdata.data);
    // console.log(initdata.data);
    // becoz initdata is exported as object in which data is field 

    console.log("Data was initiallised");
}

initDB();