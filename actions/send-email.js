import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const resend =new Resend(process.env.RESEND_API_KEY || "");
  try {
    const data = await resend.emails.send({
        from: "AssetAxis <onboarding@resend.dev>",
        to,
        subject,
        react,
    });

    return {
      success: true,};
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
    };
  }
}