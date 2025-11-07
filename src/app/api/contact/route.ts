import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { subject, message } = body;

    // Validation
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Тема и сообщение обязательны' },
        { status: 400 }
      );
    }

    if (subject.length < 3 || subject.length > 200) {
      return NextResponse.json(
        { error: 'Тема должна быть от 3 до 200 символов' },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Сообщение должно быть от 10 до 5000 символов' },
        { status: 400 }
      );
    }

    // Get recipient email from environment variable (hidden from client)
    const recipientEmail = process.env.CONTACT_EMAIL;

    if (!recipientEmail) {
      console.error('CONTACT_EMAIL environment variable is not set');
      return NextResponse.json(
        { error: 'Ошибка конфигурации сервера' },
        { status: 500 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Finappo Contact Form <onboarding@resend.dev>',
      to: recipientEmail,
      replyTo: 'noreply@finappo.com',
      subject: `Новое сообщение: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Новое сообщение с формы обратной связи</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); padding: 32px 40px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                          Новое сообщение с Finappo
                        </h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <!-- Subject -->
                        <div style="margin-bottom: 32px;">
                          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
                            Тема письма
                          </p>
                          <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600; line-height: 1.5;">
                            ${subject}
                          </p>
                        </div>

                        <!-- Message -->
                        <div style="margin-bottom: 32px;">
                          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
                            Сообщение
                          </p>
                          <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; border-left: 4px solid #2563eb;">
                            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
                              ${message}
                            </p>
                          </div>
                        </div>

                        <!-- Metadata -->
                        <div style="padding-top: 24px; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                            Получено: ${new Date().toLocaleString('ru-RU', {
                              dateStyle: 'full',
                              timeStyle: 'short',
                              timeZone: 'Europe/Moscow'
                            })}
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                          Это автоматическое сообщение с формы обратной связи<br/>
                          <strong style="color: #111827;">Finappo</strong> — Track Your Family Budget. Simply.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json(
        { error: 'Не удалось отправить сообщение' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, messageId: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
