import nodemailer from "nodemailer";
import { google } from "googleapis";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";

dotenv.config();
const CLIENT_ID = process.env.MAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.MAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.MAIL_REDIRECT_URI;
const REFRESH_TOKEN = process.env.MAIL_REFRESH_TOKEN;
const USER = process.env.MAIL_USER;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const mail = async ({
  toEmail,
  replyToEmail,
  ccEmail,
  subject,
  htmlContent,
}: {
  toEmail: string[];
  replyToEmail?: string;
  ccEmail?: string;
  subject: string;
  htmlContent: string;
}) => {
  const sendMail = async () => {
    try {
      const accessToken = await oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: USER,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      } as SMTPTransport.Options);

      const mailOptions = {
        from: USER,
        fromName: "CFI, IIT Madras",
        to: toEmail,
        cc: ccEmail,
        replyTo: replyToEmail,
        subject: subject,
        html: htmlContent,
      };
      const result = await transport.sendMail(mailOptions);
      return result;
    } catch (error) {
      return error;
    }
  };
  sendMail()
    .then((result) => console.log("Email sent...", result))
    .catch((error) => console.log(error.message));
};
