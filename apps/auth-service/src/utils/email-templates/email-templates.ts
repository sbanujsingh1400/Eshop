export const emailTemplate:any={'forgot-password-user-mail':`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        /* Basic inline styles for email client compatibility */
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eeeeee;
        }
        .email-body {
            padding-top: 20px;
            color: #333333;
            line-height: 1.6;
        }
        .otp-code {
            text-align: center;
            margin: 25px 0;
            padding: 15px;
            background-color: #e0f7fa; /* Light blue background for OTP */
            color: #00796b; /* Darker text color */
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            border-radius: 4px;
        }
        .footer-note {
            font-size: 14px;
            color: #777777;
            margin-top: 30px;
            border-top: 1px solid #eeeeee;
            padding-top: 15px;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <div style="font-size: 24px; font-weight: bold; color: #333;">Eshop Password Reset</div>
        </div>
        <div class="email-body">
            <p>Hello <%= name %> ,</p>
            <p>
                We received a request to reset your password for your Eshop account.
                If you made this request, please use the OTP below to reset your
                password:
            </p>
            
            <h2 class="otp-code"><%= otp %></h2>

            <p>
                This OTP is valid for the next 5 minutes. If you did not request a
                password reset, **please ignore this email**.
            </p>
            <p class="footer-note">
                If you need further assistance, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>`
,'seller-activation':`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Eshop</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .email-header {
      background: #4CAF50;
      color: white;
      text-align: center;
      padding: 20px;
    }
    .email-body {
      padding: 20px;
      color: #333333;
      line-height: 1.6;
    }
    .otp-code {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
      color: #4CAF50;
    }
    .footer {
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #777777;
      background: #f0f0f0;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <h1>Welcome to Eshop</h1>
    </div>
    <div class="email-body">
      <p>Hello <%= name %>,</p>
      <p>
        Thank you for registering with Eshop. To activate your seller account,
        please use the following activation code:
      </p>
      <div class="otp-code"><%= otp %></div>
      <p>
        Please enter this code on the activation page within the next 5 minutes.
      </p>
    </div>
    <div class="footer">
      &copy; <%= new Date().getFullYear() %> Eshop. All rights reserved.
    </div>
  </div>
</body>
</html>
`,
'user-activation-mail':`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Activate Your Account</title>
  <style>
    /* Inline / simple styles are best for email compatibility */
    .email-body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      padding: 20px;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
    .email-header {
      background-color: #00466a;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .email-content {
      padding: 20px;
    }
    .otp-code {
      font-size: 2rem;
      font-weight: bold;
      color: #00466a;
      margin: 20px 0;
    }
    .email-footer {
      font-size: 0.8rem;
      color: #777;
      text-align: center;
      padding: 10px 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="email-body">
    <div class="email-container">
      <div class="email-header">
        <h1>E-Shop Account Activation</h1>
      </div>
      <div class="email-content">
        <p>Hello <%= name %>,</p>
        <p>Thank you for registering with E-Shop. To activate your account, please use the following activation code:</p>
        <div class="otp-code">
          <%= otp %>
        </div>
        <p>Please enter this code on the activation page within the next 5 minutes.</p>
      </div>
      <div class="email-footer">
        <p>If you did not register, you can safely ignore this email.</p>
        <p>© <%= new Date().getFullYear() %> E-Shop. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}