<!DOCTYPE html>
<html>
<head>
    <title>{{ $transfer->subject ?? 'Ticket Action Required' }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Ticket Approved: Response Requested</h2>
        
        <p>A secure ticket request has been approved and requires your response/upload.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin-top: 0;"><strong>Ticket Subject:</strong> {{ $transfer->subject ?? 'Service Request' }}</p>
            <p><strong>From:</strong> {{ $transfer->sender->name }} ({{ $transfer->sender->email }})</p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">{{ $transfer->message ?? 'Please upload the requested files.' }}</p>
        </div>

        <p>To view the full details and upload your response, please click the button below. You will be required to verify your identity via OTP (One-Time Password) on the login portal.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ route('portal.login') }}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Secure Ticket</a>
        </div>

        <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; pt-20">
            This is an automated security notification. Please do not reply directly to this email.
        </p>
    </div>
</body>
</html>
