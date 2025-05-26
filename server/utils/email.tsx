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

export async function sendDownloadLinkEmail(
  recipientEmail: string,
  customerName: string,
  productName: string,
  downloadLink: string
): Promise<void> {
  const mailOptions = {
    from: "modeen.media@gmail.com",
    to: recipientEmail,
    subject: `Your Download Link for ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Thank You for Your Purchase!</h2>
        
        <p>Dear ${customerName},</p>
        
        <p>Thank you for purchasing <strong>${productName}</strong>. We're excited to get this into your hands!</p>
        
        <p>You can download your purchase using the link below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadLink}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Download Your Product
          </a>
        </div>
        
        <p><strong>Important:</strong> This download link is unique to your purchase. Please keep it safe and do not share it with others.</p>
        
        <p>If you have any questions or need support, please don't hesitate to contact us at modeen.media@gmail.com</p>
        
        <p>Thank you for choosing Modeen Media!</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          This email was sent to ${recipientEmail}. If you did not make this purchase, please contact us immediately.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Download link email sent successfully to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending download link email:", error);
    throw error;
  }
}
