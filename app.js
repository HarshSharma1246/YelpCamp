const express = require("express")
const app = express()
const mongoose = require("mongoose")
const path = require("path")
const Campground = require("./Model/campground")
const methodOverride = require("method-override")
const morgan = require("morgan")
const Joi = require("joi")
const ejsMate = require("ejs-mate")
const ExpressError = require("./utilities/ExpressError")
const WrapError = require("./utilities/WrapError")
const Review = require("./Model/review")

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => console.log("Database connected"))
    .catch(() => console.log("connection error:"))

app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

app.set("views", path.join(__dirname, "views"))

app.set("view engine", "ejs")
app.engine("ejs", ejsMate)

app.get("/", (req, res) => {
    res.render("campgrounds/home")
})

const validateCampground = (req, res, next) => {
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })

    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        console.log(error)
        const message = error.details.map(el => el.message).join(",")
        throw new ExpressError(message, 400)
    }
    next()
}
app.get("/campgrounds", WrapError(async (req, res, next) => {
    let campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))
app.get("/campgrounds/new", WrapError(async (req, res, next) => {
    res.render("campgrounds/new")
}))
app.post("/campgrounds", validateCampground, WrapError(async (req, res, next) => {
    let newCampground = await new Campground(req.body.campground).save()
    res.redirect(`/campgrounds/${newCampground._id}`)
}))
app.get("/campgrounds/:id", WrapError(async (req, res, next) => {
    const { id } = req.params
    let campground = await Campground.findById(id)
    res.render("campgrounds/show", { campground })
}))
app.get("/campgrounds/:id/edit", WrapError(async (req, res, next) => {
    const { id } = req.params
    let campground = await Campground.findById(id)
    res.render("campgrounds/edit", { campground })
}))

app.put("/campgrounds/:id", validateCampground, WrapError(async (req, res, next) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, req.body.campground)
    res.redirect(`/campgrounds/${id}`)
}))

app.delete("/campgrounds/:id", validateCampground, WrapError(async (req, res, next) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
}))

app.post("/campgrounds/:id/reviews", WrapError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    if (!err.status) err.status = 500
    if (!err.message) err.message = "Oh no, Something went wrong"
    res.status(err.status).render("campgrounds/error", { err })
})
app.listen(3000, function () {
    console.log("Listening to the port 3000")
})