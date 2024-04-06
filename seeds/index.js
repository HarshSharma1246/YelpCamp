const mongoose = require("mongoose")
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")
const path = require("path")
const Campground = require("../Model/campground")

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => console.log("Database connected"))
    .catch(() => console.log("connection error:"))

let sample = (array) => array[Math.floor(Math.random() * array.length)]
const seed = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        let r = Math.floor(Math.random() * 1000)
        let price = Math.floor(Math.random() * 40) * 100 + 990
        await new Campground({
            location: cities[r].city + ", " + cities[r].state,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/483251/700x550",
            price: price,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse praesentium facilis quibusdam aspernatur vel est dolore veniam voluptatibus, consequuntur maiores saepe! Placeat expedita, quisquam quas recusandae eveniet praesentium. Totam, ipsa!. Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse praesentium facilis quibusdam aspernatur vel est dolore veniam voluptatibus, consequuntur maiores saepe! Placeat expedita, quisquam quas recusandae eveniet praesentium. Totam, ipsa!"
        }).save()
    }
}

seed().then(() => mongoose.connection.close())