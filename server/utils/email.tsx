// Import the Nodemailer library
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use false for STARTTLS; true for SSL on port 465
  auth: {
    user: "modeen.media@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});
