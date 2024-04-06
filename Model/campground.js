const mongoose = require("mongoose")
const Review = require("./review")

const CampgroundSchema = new mongoose.Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String,
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }]
})

let Campground = mongoose.model("Campground", CampgroundSchema)

module.exports = Campground