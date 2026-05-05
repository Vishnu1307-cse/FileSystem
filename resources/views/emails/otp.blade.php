<!DOCTYPE html>
<html>
<head>
    <title>Your OTP Code</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{ $message->embed(public_path('image.png')) }}" alt="Pricol Logo" style="height: 50px;">
    </div>
    <h2 style="text-align: center; color: #4f46e5;">Secure Login Verification</h2>
    <p>You have requested a one-time password to access the Secure File Sharing System.</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">{{ $otp }}</span>
    </div>

    <p>This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
    
    <p style="font-size: 12px; color: #999; margin-top: 30px;">Thank you for using the Secure File Sharing System.</p>
</body>
</html>
