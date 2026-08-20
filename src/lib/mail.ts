import nodemailer from "nodemailer";
import {
  getVerificationEmailHtml,
  getResetPasswordEmailHtml,
  getDeleteAccountEmailHtml,
  getGeneralNotificationEmailHtml,
} from "./emailTemplates";
import prisma from "./prisma";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function getSiteName(): Promise<string> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    return settings?.siteName || "ألفا مانجا";
  } catch (e) {
    return "ألفا مانجا";
  }
}

export const sendOTP = async (email: string, otp: string, name?: string) => {
  const siteName = await getSiteName();
  const html = getVerificationEmailHtml({ name, otp, siteName });

  const mailOptions = {
    from: `"${siteName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `كود التحقق لتفعيل حسابك - ${siteName}`,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetOTP = async (email: string, otp: string, name?: string) => {
  const siteName = await getSiteName();
  const html = getResetPasswordEmailHtml({ name, otp, siteName });

  const mailOptions = {
    from: `"${siteName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `كود استعادة كلمة المرور - ${siteName}`,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendDeleteAccountOTP = async (email: string, otp: string, name?: string) => {
  const siteName = await getSiteName();
  const html = getDeleteAccountEmailHtml({ name, otp, siteName });

  const mailOptions = {
    from: `"${siteName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `تأكيد طلب حذف الحساب - ${siteName}`,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNotificationEmail = async ({
  email,
  userName,
  title,
  message,
  actionUrl,
  actionText,
}: {
  email: string;
  userName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}) => {
  try {
    const siteName = await getSiteName();
    const html = getGeneralNotificationEmailHtml({
      name: userName,
      title,
      message,
      actionUrl,
      actionText,
      siteName,
    });

    const mailOptions = {
      from: `"${siteName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${title} - ${siteName}`,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("sendNotificationEmail error:", err);
  }
};
