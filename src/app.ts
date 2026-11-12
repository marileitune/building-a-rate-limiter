import express from "express";

export const app = express();

app.get("/hello", (req, res) => {
  res.json({ message: "Hello World!" });
});
