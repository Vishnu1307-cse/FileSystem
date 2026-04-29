<!DOCTYPE html>
<html>
<head>
    <title>{{ $transfer->subject ?? 'File Transfer Approved' }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4f46e5;">File Transfer Approved</h2>
        
        <p>A secure file transfer has been authorized for your access.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin-top: 0;"><strong>Subject:</strong> {{ $transfer->subject ?? 'Secure File Delivery' }}</p>
            <p><strong>From:</strong> {{ $transfer->sender->name }} ({{ $transfer->sender->email }})</p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">{{ $transfer->message ?? 'No additional message provided.' }}</p>
        </div>

        <p>To view the full details and access your secure download, please click the button below. You will be required to verify your identity via OTP (One-Time Password) on the login portal.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ route('portal.login') }}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Secure Mail</a>
        </div>

        <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; pt-20">
            This is an automated security notification. Please do not reply directly to this email.
        </p>
    </div>
</body>
</html>
