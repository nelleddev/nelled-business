const resendFromEmail = process.env.RESEND_FROM_EMAIL;

if (!resendFromEmail) {
  throw new Error("RESEND_FROM_EMAIL não configurada.");
}

export const resendConfig = {
  from: resendFromEmail,
};