import { type ReactElement, type ReactNode } from 'react';
import { Resend } from 'resend';
import { Tailwind } from '@react-email/components';

import { env } from '@/env';
import { isProductionServer } from '@/utils/envs';
import tailwindConfig from '../../tailwind.config';

const resend = new Resend(env.RESEND_API_KEY);
// const URL = env.PLATFORM_URL || `https://${process.env.VERCEL_URL}`;

function EmailWrapper(props: { children: ReactNode }) {
  return (
    <Tailwind config={tailwindConfig as any}>{props.children}</Tailwind>
  );
}

interface Payload {
  to: string;
  from?: string;
  subject: string;
  body: ReactElement | string;
}

export async function sendEmail(payload: Payload) {
  const { error, data } = await resend.emails.send({
    from: payload.from ?? 'Meal Tracker <contact@mndy.link>',
    to: payload.to,
    subject: payload.subject,
    react: (
      <EmailWrapper>{payload.body}</EmailWrapper>
    ),
  });

  if (error) {
    console.log(`❌ Error sending email to ${payload.to}: ${error.message}`);
    return { success: false, email: payload.to, message: error.message };
  }

  return { success: true, email: payload.to, data };
}

interface BatchPayload {
  to: string[];
  from?: string;
  subject: string;
  body: ReactElement | string;
}

export async function sendEmailBatch(payload: BatchPayload) {
  const batch = payload.to.map((to) => ({
    from: payload.from ?? 'Writer <contact@mndy.link>',
    to,
    subject: payload.subject,
    react: (
      <EmailWrapper>{payload.body}</EmailWrapper>
    ),
  }));

  const { error, data } = await resend.batch.send(batch);

  if (error) {
    console.log(`❌ Error sending email batch: ${error.message}`);
    return { success: false, email: payload.to, message: error.message };
  }

  return { success: true, email: payload.to, data };
}

interface VerificationEmailPayload {
  email: string;
  url: string;
}
export function sendVerificationEmail(payload: VerificationEmailPayload) {
  return sendEmail({
    to: isProductionServer() ? payload.email : env.RESEND_FALLBACK_EMAIL,
    subject: 'Sign in to Writer',
    body: (
      <div>
        <p>
          Please verify your email address by clicking the link below:
        </p>
        <a href={payload.url}>{payload.url}</a>
        <br />
        <br />
        <p>
          This link will expire in 24 hours.
        </p>
      </div>
    ),
  });
}
