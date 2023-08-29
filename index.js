const fs = require("fs");
const csv = require("csv-parser");
const nodemailer = require("nodemailer");
const validator = require("email-validator");

const EMAIL_DELAY_MS = 2000; // Delay between sending emails (in milliseconds)

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

async function sendEmail(user, transporter) {
  const email = user.email.trim();

  if (!validator.validate(email)) {
    console.log(`Skipping user ${user.name} due to invalid email: ${email}`);
    return;
  }

  const mailOptions = {
    from: "mathurkiit@gmail.com",
    to: email,
    subject: "Subject of the Email",
    text: `Hello ${user.name},\n\nThis is the content of the email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}: ${error.message}`);
  }

  await new Promise((resolve) => setTimeout(resolve, EMAIL_DELAY_MS));
}

async function sendEmails(users, transporter) {
  await Promise.all(users.map(async (user) => {
    await sendEmail(user, transporter);
  }));
}

async function main() {
  try {
    const filePath = "user_data.csv";
    const users = await readCSV(filePath);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "hecticworld2003@gmail.com",
        pass: "qaemtwntipkthtwl",
      },
    });

    await sendEmails(users, transporter);
    console.log("All emails sent successfully!");
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

main();
