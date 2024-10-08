const express = require("express");
const app = express();
const dotenv = require("dotenv");

const userRoutes = require("./Routes/User");
const profileRoutes = require("./Routes/Profile");
const paymentRoutes = require("./Routes/Payment");
const courseRoutes = require("./Routes/Course");
const contactUsRoute = require("./Routes/Contact");
const database = require("./Config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./Config/cloudinary");
const fileUpload = require("express-fileupload");

dotenv.config();
const PORT = process.env.PORT || 4000;
database.connect();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://study-notion-front-end.vercel.app",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);
cloudinaryConnect();

// routes
app.use("/auth", userRoutes);
app.use("/profile", profileRoutes);
app.use("/course", courseRoutes);
app.use("/payment", paymentRoutes);
app.use("/reach", contactUsRoute);


app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is running",
  });
});

app.listen(PORT, () => {});
