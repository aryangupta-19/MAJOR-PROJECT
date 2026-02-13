require('dotenv').config();
const isProduction = process.env.NODE_ENV === "production";

console.log("MAP_TOKEN exists:", !!process.env.MAP_TOKEN);

console.log("MAP_TOKEN:", process.env.MAP_TOKEN);
console.log("MAP_TOKEN exists:", !!process.env.MAP_TOKEN);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const {ExpressError} = require("./utils/ExpressError.js");
const session = require('express-session');
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected to DB...!");
}).catch((err) => {
    console.log(err);
});

async function main(){
    // await mongoose.connect(MONGO_URL);
    await mongoose.connect(dbUrl);
}
if (!dbUrl) {
    console.error("CRITICAL ERROR: ATLASDB_URL is not defined in Railway Variables!");
}
const store = MongoStore.default.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600,
});

const sessionOptions = {
    store,
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,   //
    cookie: {
        // expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,       // required in production 
        sameSite: isProduction ? "none" : "lax",   // required in railway 
    }   
};

app.set("trust proxy", 1);  // Railway runs behind a proxy (HTTPS). Without this line, secure cookies won’t work properly.
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());   
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=> {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// app.get("/testListening", async (req, res) => {
//     const samplelist = new Listing({
//         title: "My first Villa",
//         discription: "Near the beach",
//         price: 12000,
//         location: "peer Mitha, Jammu",
//         country: "India"
//     });
//     await samplelist.save();
//     console.log('Sample was saved');
//     res.send("Successfull Testing");
// });

// ab yeh listing tbhi add hogi hab testListening link pr jayenge 



// Error Handling Middleware
// replace app.all with this in newer versions of express 
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something Went Wrong"} = err;
    // res.status(statusCode).send("Something Went Wrong!");
    res.status(statusCode).render("listings/error.ejs", {err});
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is Listening on port ${port}`);
});