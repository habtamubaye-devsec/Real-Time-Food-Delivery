require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const Restaurant = require("./models/Restaurant");
const User = require("./models/Users");
const logger = require("./utils/logger");
const connectDB = require("./config/db");

// Joi schemas for validation
const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  phone: Joi.string()
    .pattern(/^\+?\d{10,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone must be a valid phone number (10-15 digits)",
      "any.required": "Phone is required",
    }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("restaurant").required().messages({
    "string.valid": "Role must be restaurant for seeding",
  }),
});

const restaurantSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({ "any.required": "Restaurant name is required" }),
  location: Joi.object({
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),
  menu: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        price: Joi.number().positive().required(),
        description: Joi.string().allow(""),
        image: Joi.string().allow(""),
        inStock: Joi.boolean().default(true),
      })
    )
    .required(),
  verified: Joi.boolean().default(true),
});

const seedData = [
  {
    name: "Injera House",
    location: { type: "Point", coordinates: [38.7578, 9.0346] },
    menu: [
      {
        name: "Doro Wat",
        price: 120,
        description: "Spicy chicken stew with egg",
        image: "",
        inStock: true,
      },
      {
        name: "Tibs",
        price: 90,
        description: "Fried beef cubes with onions and spices",
        image: "",
        inStock: true,
      },
    ],
    verified: true,
    user: {
      email: "injera@fooddelivery.com",
      phone: "+251912345678",
      password: "Injera2025!",
      role: "restaurant",
    },
  },
  {
    name: "Little Italy",
    location: { type: "Point", coordinates: [38.7489, 9.0302] },
    menu: [
      {
        name: "Lasagna",
        price: 150,
        description: "Layers of pasta with cheese and sauce",
        image: "",
        inStock: true,
      },
      {
        name: "Garlic Bread",
        price: 40,
        description: "Crispy bread with garlic butter",
        image: "",
        inStock: true,
      },
    ],
    verified: true,
    user: {
      email: "italy@fooddelivery.com",
      phone: "+251912345679",
      password: "Italy2025!",
      role: "restaurant",
    },
  },
  {
    name: "Sushi Zen",
    location: { type: "Point", coordinates: [38.7611, 9.0403] },
    menu: [
      {
        name: "California Roll",
        price: 180,
        description: "Crab, avocado, cucumber",
        image: "",
        inStock: true,
      },
      {
        name: "Salmon Nigiri",
        price: 200,
        description: "Salmon over vinegared rice",
        image: "",
        inStock: true,
      },
    ],
    verified: true,
    user: {
      email: "sushi@fooddelivery.com",
      phone: "+251912345680",
      password: "Sushi2025!",
      role: "restaurant",
    },
  },
  {
    name: "Burger Base",
    location: { type: "Point", coordinates: [38.7633, 9.0455] },
    menu: [
      {
        name: "Classic Burger",
        price: 95,
        description: "Beef patty with lettuce and cheese",
        image: "",
        inStock: true,
      },
      {
        name: "Fries",
        price: 30,
        description: "Crispy golden fries",
        image: "",
        inStock: true,
      },
    ],
    verified: true,
    user: {
      email: "burger@fooddelivery.com",
      phone: "+251912345681",
      password: "Burger2025!",
      role: "restaurant",
    },
  },
  {
    name: "Vegan Vibes",
    location: { type: "Point", coordinates: [38.7592, 9.039] },
    menu: [
      {
        name: "Tofu Stir Fry",
        price: 110,
        description: "Tofu with mixed vegetables",
        image: "",
        inStock: true,
      },
      {
        name: "Vegan Bowl",
        price: 125,
        description: "Grains, greens, and beans",
        image: "",
        inStock: true,
      },
    ],
    verified: true,
    user: {
      email: "vegan@fooddelivery.com",
      phone: "+251912345682",
      password: "Vegan2025!",
      role: "restaurant",
    },
  },
  {
    name: "Shawarma King",
    location: { type: "Point", coordinates: [38.766, 9.048] },
    menu: [
      {
        name: "Chicken Shawarma",
        price: 85,
        description: "Grilled chicken with garlic sauce",
        image: "",
        inStock: true,
      },
      {
        name: "Falafel Wrap",
        price: 70,
        description: "Chickpea balls in pita bread",
        image: "",
        inStock: true,
      },
    ],
    verified: true,
    user: {
      email: "shawarma@fooddelivery.com",
      phone: "+251912345683",
      password: "Shawarma2025!",
      role: "restaurant",
    },
  },
  {
    name: "Curry Spot",
    location: { type: "Point", coordinates: [38.7512, 9.0378] },
    menu: [
      {
        name: "Chicken Curry",
        price: 130,
        description: "Spicy Indian-style curry",
        image: "",
        inStock: true,
      },
      {
        name: "Naan Bread",
        price: 35,
        description: "Oven-baked flatbread",
        image: "",
        inStock: true,
      },
    ],
    verified: true,
    user: {
      email: "curry@fooddelivery.com",
      phone: "+251912345684",
      password: "Curry2025!",
      role: "restaurant",
    },
  },
  {
    name: "MexiBites",
    location: { type: "Point", coordinates: [38.7644, 9.0321] },
    menu: [
      {
        name: "Tacos",
        price: 80,
        description: "Corn tortillas with beef and salsa",
        image: "",
        inStock: true,
      },
      {
        name: "Burrito Bowl",
        price: 140,
        description: "Rice, beans, veggies, and meat",
        image: "",
        inStock: true,
      },
    ],
    verified: true,
    user: {
      email: "mexi@fooddelivery.com",
      phone: "+251912345685",
      password: "Mexi2025!",
      role: "restaurant",
    },
  },
  {
    name: "Waffle World",
    location: { type: "Point", coordinates: [38.7493, 9.0356] },
    menu: [
      {
        name: "Belgian Waffle",
        price: 75,
        description: "Thick waffle with syrup",
        image: "",
        inStock: true,
      },
      {
        name: "Strawberry Delight",
        price: 90,
        description: "Waffle topped with strawberries",
        image: "",
        inStock: true,
      },
    ],
    verified: true,
    user: {
      email: "waffle@fooddelivery.com",
      phone: "+251912345686",
      password: "Waffle2025!",
      role: "restaurant",
    },
  },
  {
    name: "Fusion Feast",
    location: { type: "Point", coordinates: [38.7557, 9.0382] },
    menu: [
      {
        name: "Korean BBQ Pizza",
        price: 160,
        description: "Pizza with Korean-style beef",
        image: "",
        inStock: true,
      },
      {
        name: "Samosa Tacos",
        price: 85,
        description: "Fusion of Indian samosas and Mexican tacos",
        image: "",
        inStock: true,
      },
    ],
    verified: true,
    user: {
      email: "fusion@fooddelivery.com",
      phone: "+251912345687",
      password: "Fusion2025!",
      role: "restaurant",
    },
  },
];

const seedRestaurants = async () => {
  try {
    await connectDB();
    logger.info("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({ role: "restaurant" });
    await Restaurant.deleteMany();
    logger.info("🧹 Cleared existing restaurant and user data");

    const restaurantsToInsert = [];
    for (const data of seedData) {
      // Validate user data
      const { error: userError, value: userData } = userSchema.validate(
        data.user
      );
      if (userError) {
        throw new Error(
          `User validation failed for ${data.name}: ${userError.details
            .map((d) => d.message)
            .join(", ")}`
        );
      }

      // Validate restaurant data
      const { error: restaurantError } = restaurantSchema.validate({
        name: data.name,
        location: data.location,
        menu: data.menu,
        verified: data.verified,
      });
      if (restaurantError) {
        throw new Error(
          `Restaurant validation failed for ${
            data.name
          }: ${restaurantError.details.map((d) => d.message).join(", ")}`
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = new User({
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role,
      });
      await user.save();

      // Prepare restaurant with ownerId
      restaurantsToInsert.push({
        name: data.name,
        location: data.location,
        ownerId: user._id,
        menu: data.menu,
        verified: data.verified,
      });
    }

    // Insert restaurants
    await Restaurant.insertMany(restaurantsToInsert);
    logger.info("🍽️ Seeded restaurants and users successfully");
    await mongoose.connection.close();
    logger.info("🔌 MongoDB connection closed");
    process.exit();
  } catch (err) {
    logger.error(`❌ Error seeding data: ${err.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedRestaurants();
