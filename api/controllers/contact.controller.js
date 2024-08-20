import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (req, res, next) => {
    const { from, to, subject, text } = req.body;
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: `Regarding  ${subject}`, //recieving the listing name from the client side
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center;">
                <h1 style=" color: #444; margin-bottom: 20px;">
                    Requesting Information for ${subject}
                </h1>
                <p style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; color: #333; line-height: 1.5;">
                    Message from <span style="font-weight: bold;">${from}</span>: ${text}
                </p>
                <p style=" margin-top: 20px; color: #888;">
                    Please contact the email for further communication.
                </p>
                <p style="text-align: left;">
                    Sincerely,<br/> Co-WorkHub Support Team
                </p>
            </div>
            `
        };        
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email send successfully." });
    } catch (error) {
        next(error);
    }
};