import nodemailer, { type Transporter } from 'nodemailer'
import { env, isProd } from '../env'

export type MailMessage = {
  to: string
  subject: string
  html: string
  text: string
}

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!env.SMTP_HOST) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  }
  return transporter
}

/**
 * Send an email. When SMTP is not configured the message is logged to the
 * server console (development fallback) so flows can still be exercised.
 * Returns `{ delivered }` so callers know whether a real address was used.
 */
export async function sendMail(message: MailMessage): Promise<{ delivered: boolean }> {
  const tx = getTransporter()
  if (!tx) {
    if (isProd) {
      console.error('[mail] SMTP is not configured — email NOT sent:', message.subject, '->', message.to)
    } else {
      console.log('\n[mail:dev] ─────────────────────────────────────────────')
      console.log(`  to:      ${message.to}`)
      console.log(`  subject: ${message.subject}`)
      console.log(`  body:    ${message.text}`)
      console.log('─────────────────────────────────────────────────────────\n')
    }
    return { delivered: false }
  }
  await tx.sendMail({
    from: env.MAIL_FROM,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  })
  return { delivered: true }
}

function wrap(title: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#fff8f0;font-family:'Google Sans',Arial,sans-serif;color:#3a1220">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <h1 style="font-family:Georgia,serif;color:#4a1025;font-size:22px">${title}</h1>
    <div style="font-size:15px;line-height:1.7;color:#3a1220">${body}</div>
    ${
      cta
        ? `<p style="margin:28px 0"><a href="${cta.url}" style="background:#b5284d;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">${cta.label}</a></p>
           <p style="font-size:12px;color:#8a6b76">If the button does not work, copy this link:<br/>${cta.url}</p>`
        : ''
    }
    <p style="margin-top:32px;font-size:12px;color:#8a6b76">${env.BRAND_NAME} — ${env.BRAND_TAGLINE}</p>
  </div></body></html>`
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${env.APP_BASE_URL}/verify-email?token=${encodeURIComponent(token)}`
  return sendMail({
    to,
    subject: `Verify your ${env.BRAND_NAME} account`,
    text: `Welcome to ${env.BRAND_NAME}! Verify your email: ${url}`,
    html: wrap(
      `Welcome to ${env.BRAND_NAME}!`,
      '<p>One quick step and your account is ready. Please confirm your email address.</p>',
      { label: 'Verify my email', url },
    ),
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${env.APP_BASE_URL}/reset-password?token=${encodeURIComponent(token)}`
  return sendMail({
    to,
    subject: `Reset your ${env.BRAND_NAME} password`,
    text: `Reset your password: ${url}`,
    html: wrap(
      'Reset your password',
      '<p>We received a request to reset your password. This link expires in 1 hour. If this was not you, you can ignore this email.</p>',
      { label: 'Reset password', url },
    ),
  })
}

export async function sendPaymentConfirmation(to: string, planName: string, amountLabel: string, projectTitle: string) {
  return sendMail({
    to,
    subject: `Payment received for ${projectTitle}`,
    text: `We received your payment of ${amountLabel} for the ${planName} plan. You can now publish "${projectTitle}".`,
    html: wrap(
      'Payment received ❤️',
      `<p>Thank you! We received <strong>${amountLabel}</strong> for the <strong>${planName}</strong> plan.</p><p>Your surprise "<strong>${projectTitle}</strong>" is ready to publish.</p>`,
      { label: 'Go to my dashboard', url: `${env.APP_BASE_URL}/dashboard` },
    ),
  })
}

export async function sendPublishConfirmation(to: string, projectTitle: string, publicUrl: string) {
  return sendMail({
    to,
    subject: `"${projectTitle}" is live`,
    text: `Your surprise is live at ${publicUrl}`,
    html: wrap(
      'Your surprise is live ✨',
      `<p>"<strong>${projectTitle}</strong>" is published and ready to share.</p>`,
      { label: 'Open my surprise', url: publicUrl },
    ),
  })
}

export async function sendExpiryReminder(to: string, projectTitle: string, expiresAt: Date, publicUrl: string) {
  const days = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000))
  return sendMail({
    to,
    subject: `“${projectTitle}” expires in ${days} day(s)`,
    text: `Your published surprise expires on ${expiresAt.toDateString()}. Renew to keep it live: ${publicUrl}`,
    html: wrap(
      'Your surprise is expiring soon',
      `<p>"<strong>${projectTitle}</strong>" will expire in <strong>${days} day(s)</strong> (on ${expiresAt.toDateString()}).</p>`,
      { label: 'Renew hosting', url: `${env.APP_BASE_URL}/dashboard/projects` },
    ),
  })
}

export async function sendExpiredNotice(to: string, projectTitle: string) {
  return sendMail({
    to,
    subject: `“${projectTitle}” has expired`,
    text: `Your published surprise has expired and is no longer publicly accessible.`,
    html: wrap(
      'Your surprise has expired',
      `<p>"<strong>${projectTitle}</strong>" is no longer publicly accessible. Renew hosting to bring it back.</p>`,
      { label: 'Renew hosting', url: `${env.APP_BASE_URL}/dashboard/projects` },
    ),
  })
}

export async function sendSupportReceivedEmail(to: string, subject: string) {
  return sendMail({
    to,
    subject: `We received your message: ${subject}`,
    text: `Thanks for reaching out to ${env.BRAND_NAME}. Our team will reply within 24 hours.\n\nSubject: ${subject}`,
    html: wrap(
      'We received your message',
      `<p>Thanks for reaching out about "<strong>${subject}</strong>". Our team will reply within 24 hours.</p>`,
    ),
  })
}
