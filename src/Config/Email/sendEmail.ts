import nodemailer from "nodemailer";

export async function sendEmail(data: any) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MP,
    },
  });

  await transporter.sendMail({
    from: {
      name: "Infant Guard Code",
      address:
        "This is the code you requested to log in into infant guard system",
    },
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.htm,
  });
}
