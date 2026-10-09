const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const db = require("./models");
const mainRouter = require("./router");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.set("trust proxy", 1);

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use(session({
    secret: process.env.SESSION_SECRET || "rahasia_vts_merak",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "lax"
    }
}));

app.use("/api", mainRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

db.sequelize.sync({ alter: process.env.DB_SYNC_ALTER === "true" })
    .then(() => {
        console.log("Semua model berhasil disinkronkan.");
        app.listen(PORT, () => {
            console.log(`Server berjalan di port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Gagal sinkronisasi database:", err);
        process.exit(1);
    });