const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const profilesRouter = require("./routes/profiles");
const subjectsRouter = require("./routes/subjects");
const topicsRouter = require("./routes/topics");
const questionsRouter = require("./routes/questions");
const progressRouter = require("./routes/progress");
// const authRoutes = require('./routes/auth');

const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 8000;
console.log("PORT:", PORT);

app.use(cors());
app.use(express.json());

app.use("/profiles", profilesRouter);
app.use("/progress", progressRouter);
app.use("/questions", questionsRouter);
app.use("/subjects", subjectsRouter);
app.use("/topics", topicsRouter);
// app.use('/auth', authRoutes);
app.use(errorHandler);

/* simple health check */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", at: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.send("CivilAnki backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
