const nodemailer = require("nodemailer")

// Create transporter
const createTransport = () => {
  if (process.env.NODE_ENV === "production") {
    // Production email service (e.g., SendGrid, AWS SES)
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  } else {
    // Development - use Ethereal Email for testing
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || "ethereal.user@ethereal.email",
        pass: process.env.ETHEREAL_PASS || "ethereal.pass",
      },
    })
  }
}

// Email templates
const templates = {
  welcome: (data) => ({
    subject: "Welcome to Fashion Store!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ec4899, #be185d); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Fashion Store!</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${data.name}!</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining Fashion Store! We're excited to have you as part of our community.
          </p>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Your account has been created with the email: <strong>${data.email}</strong>
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
               style="background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Start Shopping
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2024 Fashion Store. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (data) => ({
    subject: "Reset Your Password - Fashion Store",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ec4899, #be185d); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${data.name}!</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Fashion Store account.
          </p>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Click the button below to reset your password. This link will expire in 1 hour.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" 
               style="background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2024 Fashion Store. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
}

// Send email function
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransport()

    let emailContent = {}

    if (template && templates[template]) {
      const templateContent = templates[template](data)
      emailContent = {
        subject: templateContent.subject,
        html: templateContent.html,
      }
    } else {
      emailContent = {
        subject,
        html,
        text,
      }
    }

    const mailOptions = {
      from: `"Fashion Store" <${process.env.EMAIL_FROM || "noreply@fashionstore.com"}>`,
      to,
      ...emailContent,
    }

    const result = await transporter.sendMail(mailOptions)

    if (process.env.NODE_ENV === "development") {
      console.log("Email sent:", nodemailer.getTestMessageUrl(result))
    }

    return result
  } catch (error) {
    console.error("Email sending error:", error)
    throw error
  }
}

module.exports = {
  sendEmail,
}
