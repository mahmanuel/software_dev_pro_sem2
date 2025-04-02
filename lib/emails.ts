import nodemailer from "nodemailer"

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: process.env.NODE_ENV === "production",
})

type EmailPayload = {
  to: string
  subject: string
  html: string
}

// Send email
export const sendEmail = async (payload: EmailPayload) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...payload,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Email templates
export const emailTemplates = {
  issueCreated: (issueTitle: string, issueId: string) => ({
    subject: `New Issue Created: ${issueTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Issue Created</h2>
        <p>A new issue has been created: <strong>${issueTitle}</strong></p>
        <p>Click the button below to view the issue:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/issues/${issueId}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Issue
        </a>
      </div>
    `,
  }),

  issueAssigned: (issueTitle: string, issueId: string) => ({
    subject: `Issue Assigned: ${issueTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Issue Assigned</h2>
        <p>You have been assigned to an issue: <strong>${issueTitle}</strong></p>
        <p>Click the button below to view the issue:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/issues/${issueId}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Issue
        </a>
      </div>
    `,
  }),

  statusUpdated: (issueTitle: string, issueId: string, status: string) => ({
    subject: `Issue Status Updated: ${issueTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Issue Status Updated</h2>
        <p>The status of issue <strong>${issueTitle}</strong> has been updated to <strong>${status}</strong>.</p>
        <p>Click the button below to view the issue:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/issues/${issueId}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Issue
        </a>
      </div>
    `,
  }),

  commentAdded: (issueTitle: string, issueId: string, commenterName: string) => ({
    subject: `New Comment on Issue: ${issueTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Comment Added</h2>
        <p><strong>${commenterName}</strong> added a comment to issue <strong>${issueTitle}</strong>.</p>
        <p>Click the button below to view the comment:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/issues/${issueId}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Comment
        </a>
      </div>
    `,
  }),
}

