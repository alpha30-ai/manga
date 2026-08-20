/**
 * Ultra-Distinct Professional HTML Email Templates for Alpha Manga
 * Distinct visual styles, colors, hazard badges, and security indicators for each notification type.
 */

interface BaseEmailProps {
  name?: string;
  otp?: string;
  siteName?: string;
  device?: string;
  ipAddress?: string;
  location?: string;
  time?: string;
  title?: string;
  message?: string;
  actionUrl?: string;
  actionText?: string;
}

function getBaseTemplate(
  content: string,
  title: string,
  siteName = "Alpha Manga (ألفا مانجا)",
  accentColor = "#FF334B"
): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090b;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Tahoma, Geneva, Verdana, sans-serif;
      color: #f4f4f5;
      direction: rtl;
      text-align: right;
    }
    .wrapper {
      width: 100%;
      background-color: #09090b;
      padding: 40px 10px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #121215;
      border: 1px solid #27272a;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);
    }
    .header {
      padding: 32px 32px 24px;
      text-align: center;
      background-color: #09090b;
      border-bottom: 1px solid #27272a;
    }
    .logo-container {
      display: inline-block;
      padding: 10px 20px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-accent {
      color: ${accentColor};
    }
    .content {
      padding: 36px 32px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin: 16px 0 12px;
      line-height: 1.4;
    }
    .text {
      font-size: 15px;
      line-height: 1.7;
      color: #a1a1aa;
      margin: 0 0 20px;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .footer {
      padding: 24px 32px;
      border-top: 1px solid #27272a;
      background-color: #09090b;
      text-align: center;
      font-size: 12px;
      color: #71717a;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-container">
          <span class="brand-title">ALPHA <span class="brand-accent">MANGA</span></span>
        </div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p style="margin: 0 0 6px;">© ${new Date().getFullYear()} ${siteName}. جميع الحقوق محفوظة.</p>
        <p style="margin: 0;">هذه رسالة أمنية مشفرة، لا تقم بمشاركة محتواها مع أي طرف آخر.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 1. Account Verification & Registration OTP (EMERALD / GREEN THEME)
 */
export function getVerificationEmailHtml({
  name = "عزيزي القارئ",
  otp = "000000",
  siteName = "ألفا مانجا",
}: BaseEmailProps): string {
  const content = `
    <div class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">
      ✅ تأكيد الحساب الجديد
    </div>
    <h1 class="title">مرحباً بك في مجتمع ${siteName}، ${name}!</h1>
    <p class="text">
      شكراً لتسجيلك معنا. لإكمال تفعيل حسابك والبدء في حفظ تقدمك في القراءة والمفضلة، يرجى إدخال رمز التحقق أدناه:
    </p>

    <div style="background: #09090b; border: 2px solid #10b981; border-radius: 20px; padding: 26px; text-align: center; margin: 28px 0; box-shadow: 0 0 25px rgba(16, 185, 129, 0.15);">
      <div style="font-size: 12px; font-weight: 700; color: #10b981; text-transform: uppercase; margin-bottom: 8px;">رمز تفعيل الحساب (صالح لمدة 15 دقيقة)</div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #ffffff; text-shadow: 0 0 15px rgba(16, 185, 129, 0.5);">${otp}</div>
      <div style="font-size: 12px; color: #71717a; margin-top: 8px;">أدخل هذا الرمز في صفحة التأكيد للمتابعة</div>
    </div>

    <p class="text" style="font-size: 13px; color: #71717a;">
      إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان.
    </p>
  `;
  return getBaseTemplate(content, "تأكيد الحساب - ألفا مانجا", siteName, "#10b981");
}

/**
 * 2. New Device Login Alert (AMBER / WARNING THEME)
 */
export function getNewLoginAlertHtml({
  name = "عزيزي القارئ",
  device = "متصفح غير معروف",
  ipAddress = "192.168.1.1",
  location = "الشرق الأوسط",
  time = new Date().toLocaleString("ar-EG"),
  siteName = "ألفا مانجا",
}: BaseEmailProps): string {
  const content = `
    <div class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
      ⚠️ تنبيه أمان: تسجيل دخول جديد
    </div>
    <h1 class="title">تم رصد محاولة تسجيل دخول جديدة لحسابك</h1>
    <p class="text">
      مرحباً ${name}، تم تسجيل الدخول إلى حسابك على <strong>${siteName}</strong> من جهاز أو موقع جديد. فيما يلي تفاصيل النشاط:
    </p>

    <div style="background: #09090b; border: 1px solid #f59e0b; border-radius: 18px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #d4d4d8;">
        <tr>
          <td style="padding: 6px 0; color: #a1a1aa;">📱 الجهاز / المتصفح:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: left;" dir="ltr">${device}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #a1a1aa;">🌐 عنوان IP:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: left;" dir="ltr">${ipAddress}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #a1a1aa;">📍 الموقع التقريبي:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: left;">${location}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #a1a1aa;">⏰ التوقيت:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: left;">${time}</td>
        </tr>
      </table>
    </div>

    <div style="background: rgba(239, 68, 68, 0.1); border-right: 4px solid #ef4444; border-radius: 8px; padding: 14px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; font-weight: 700; color: #f87171;">
        هل كنت أنت من قام بتسجيل الدخول؟
      </p>
      <p style="margin: 4px 0 0; font-size: 12px; color: #fca5a5;">
        إذا لم تكن أنت، يرجى الدخول فوراً إلى حسابك وتغيير كلمة المرور لحماية بياناتك.
      </p>
    </div>
  `;
  return getBaseTemplate(content, "تنبيه أمان - تسجيل دخول جديد", siteName, "#f59e0b");
}

/**
 * 3. Account Deletion Confirmation - CRITICAL HAZARD (CRIMSON / RED THEME)
 */
export function getDeleteAccountEmailHtml({
  name = "عزيزي القارئ",
  otp = "000000",
  siteName = "ألفا مانجا",
}: BaseEmailProps): string {
  const content = `
    <div class="badge" style="background: rgba(220, 38, 38, 0.2); color: #f87171; border: 1px solid rgba(220, 38, 38, 0.5);">
      🚨 تحذير أمني حرج: طلب حذف الحساب نهائياً
    </div>
    <h1 class="title" style="color: #f87171;">تأكيد حذف الحساب ومسح البيانات نهائياً</h1>
    <p class="text">
      مرحباً ${name}، لقد تلقينا طلباً بحذف حسابك نهائياً من منصة <strong>${siteName}</strong>.
    </p>

    <div style="background: rgba(220, 38, 38, 0.1); border: 2px dashed #dc2626; border-radius: 20px; padding: 24px; text-align: center; margin: 24px 0;">
      <div style="font-size: 13px; font-weight: 800; color: #ef4444; margin-bottom: 6px;">
        ⚠️ تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه
      </div>
      <div style="font-size: 12px; color: #fca5a5; margin-bottom: 16px;">
        سيتم مسح سجل قراءتك، مفضلتك، تعليقاتك، وكافة بياناتك المسجلة لدينا فور التأكيد.
      </div>
      <div style="font-size: 11px; font-weight: 700; color: #a1a1aa; text-transform: uppercase;">كود تأكيد الحذف (صالح لمدة 5 دقائق فقط)</div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #ef4444; margin: 10px 0; text-shadow: 0 0 20px rgba(220, 38, 38, 0.6);">${otp}</div>
    </div>

    <p class="text" style="font-size: 13px; color: #ef4444; font-weight: 600;">
      إذا لم تقم بطلب حذف الحساب بنفسك، قم بتسجيل الدخول وتغيير كلمة مرورك فوراً، فقد يكون حسابك معرضاً للاختراق!
    </p>
  `;
  return getBaseTemplate(content, "تحذير حرج: تأكيد حذف الحساب", siteName, "#dc2626");
}

/**
 * 4. Password Reset OTP (PURPLE / INDIGO THEME)
 */
export function getResetPasswordEmailHtml({
  name = "عزيزي القارئ",
  otp = "000000",
  siteName = "ألفا مانجا",
}: BaseEmailProps): string {
  const content = `
    <div class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">
      🔑 استعادة وتغيير كلمة المرور
    </div>
    <h1 class="title">طلب إعادة تعيين كلمة المرور</h1>
    <p class="text">
      مرحباً ${name}، لقد تلقينا طلباً لاستعادة وتعيين كلمة مرور جديدة لحسابك على <strong>${siteName}</strong>.
    </p>

    <div style="background: #09090b; border: 2px solid #6366f1; border-radius: 20px; padding: 26px; text-align: center; margin: 28px 0; box-shadow: 0 0 25px rgba(99, 102, 241, 0.2);">
      <div style="font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; margin-bottom: 8px;">رمز إعادة تعيين كلمة المرور (صالح لمدة 15 دقيقة)</div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #ffffff; text-shadow: 0 0 15px rgba(99, 102, 241, 0.5);">${otp}</div>
      <div style="font-size: 12px; color: #71717a; margin-top: 8px;">أدخل هذا الرمز لتتمكن من كتابة كلمة المرور الجديدة</div>
    </div>

    <p class="text" style="font-size: 13px; color: #71717a;">
      إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد ولن يتم تغيير أي شيء.
    </p>
  `;
  return getBaseTemplate(content, "استعادة كلمة المرور - ألفا مانجا", siteName, "#6366f1");
}

/**
 * 5. General Notification Email (NEW CHAPTERS / BOOKMARKS ALERTS)
 */
export function getGeneralNotificationEmailHtml({
  name = "عزيزي القارئ",
  title = "إشعار جديد",
  message = "",
  actionUrl,
  actionText = "عرض التفاصيل",
  siteName = "ألفا مانجا",
}: BaseEmailProps): string {
  const content = `
    <div class="badge" style="background: rgba(255, 51, 75, 0.15); color: #FF334B; border: 1px solid rgba(255, 51, 75, 0.3);">
      🔥 تحديث جديد ومميز
    </div>
    <h1 class="title">${title}</h1>
    <p class="text">
      مرحباً ${name}،
    </p>
    <p class="text">
      ${message}
    </p>

    ${
      actionUrl
        ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${actionUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FF334B 0%, #e11d48 100%); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; border-radius: 16px; box-shadow: 0 10px 25px rgba(255, 51, 75, 0.35);">
          ${actionText}
        </a>
      </div>
      `
        : ""
    }
  `;
  return getBaseTemplate(content, title, siteName, "#FF334B");
}
