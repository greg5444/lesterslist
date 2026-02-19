// Test SMTP email configuration
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmailConnection() {
  console.log('🧪 Testing Email Configuration...\n');
  console.log('SMTP Settings:');
  console.log(`  Host: ${process.env.SMTP_HOST}`);
  console.log(`  Port: ${process.env.SMTP_PORT}`);
  console.log(`  User: ${process.env.SMTP_USER}`);
  console.log(`  Admin Email: ${process.env.ADMIN_EMAIL}\n`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('📡 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: `"Lester's List Test" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '✅ Test Email - SMTP Configuration Working',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3D8C95;">SMTP Configuration Test</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #225675;">Configuration Details</h3>
            <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
            <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</p>
            <p><strong>From Address:</strong> ${process.env.SMTP_USER}</p>
            <p><strong>Admin Email:</strong> ${process.env.ADMIN_EMAIL}</p>
          </div>
          
          <div style="background: #d4edda; padding: 15px; border-radius: 8px; border: 1px solid #c3e6cb; margin: 20px 0;">
            <p style="margin: 0; color: #155724;">
              ✅ <strong>Success!</strong> Your email notifications are configured correctly and ready to use.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            You will now receive email notifications when users submit jams or learning resources.
          </p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`\n📬 Check ${process.env.ADMIN_EMAIL} for the test email.\n`);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. Please check:');
      console.error('   - SMTP_USER is correct');
      console.error('   - SMTP_PASS is correct');
      console.error('   - Account has SMTP access enabled');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n💡 Connection failed. Please check:');
      console.error('   - SMTP_HOST is correct');
      console.error('   - SMTP_PORT is correct');
      console.error('   - Firewall allows outbound SMTP connections');
    }
    console.error('\n');
  }
}

testEmailConnection();
