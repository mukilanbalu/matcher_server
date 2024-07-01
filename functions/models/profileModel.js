const mongoose = require("mongoose");
const app_users = require("./userModel");


const engDObSchema = new mongoose.Schema({
    dob: { type: String, required: true },
    time: { type: String, required: true },
    day: { type: String, required: true },
    age: { type: String, required: true },
    place: { type: String, required: true },
    tamil_year: { type: String, required: true },
    tamil_date: { type: String, required: true },
    tamil_month: { type: String, required: true }
})

const professionalSchema = new mongoose.Schema({
    education: { type: String, required: true },
    job: { type: String, required: true },
    sector: { type: String, required: true },
    location: { type: String, required: true },
    income: { type: String, required: true },

})

const astroSchema = new mongoose.Schema({
    gothram: { type: String, required: true },
    rasi: { type: String, required: true },
    nakshatram: { type: String, required: true },
    patham: { type: String, required: true },
    lagnam: { type: String, required: true },
    img: { type: String, required: true }
})


const familySchema = new mongoose.Schema({
    father_name: { type: String, required: true },
    father_job: { type: String, required: true },
    mother_name: { type: String, required: true },
    mother_job: { type: String, required: true },
    income: { type: String, required: true },
    ancestral_origin: { type: String, required: true },
    kuladeivam: { type: String, required: true },
    brothers: { type: String },
    sisters: { type: String },
    married_sisters: { type: String },
    married_brothers: { type: String },
    mobile: { type: String, required: true },
    address: { type: String, required: true },

})


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, ref: "app_users" },
    height: { type: String, required: true },
    weight: { type: String, required: true },
    colour: { type: String, required: true },
    gender: { type: String, required: true },
    profile_img: [{ type: String, required: true }],
    birth: { type: engDObSchema, required: true },
    professional: { type: professionalSchema, required: true },
    astro: { type: astroSchema, required: true },
    family: { type: familySchema, required: true }
})

module.exports = mongoose.model("user_profiles", userSchema)