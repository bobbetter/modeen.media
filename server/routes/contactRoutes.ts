import { type Express } from "express";
import { storage } from "../storage";
import { insertContactSchema } from "@shared/schema";
import { transporter } from "../utils/email";

export function registerContactRoutes(app: Express): void {
app.post("/api/contact", async (req, res) => {
  try {
    const validation = insertContactSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid form data",
        errors: validation.error.format(),
      });
    }

    const contact = await storage.createContact(validation.data);

    // Configure the mailoptions object
    const mailOptions = {
      from: "yourusername@email.com",
      to: "modeen.media@gmail.com",
      subject: "User Contact through website",
      html: `<p>Name: ${validation.data.name}</p>
      <p>Email: ${validation.data.email}</p>
      <p>Message: ${validation.data.message}</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error:", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });

    return res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while submitting the form",
    });
  }
});

app.get("/api/contact", async (req, res) => {
  try {
    const contacts = await storage.getContacts();
    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching contacts",
    });
  }
});

}