<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; }
        .header { border-bottom: 2px solid #f4f4f4; padding-bottom: 10px; margin-bottom: 20px; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
        .body-content { white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ $message->embed(public_path('image.png')) }}" alt="Pricol Logo" style="height: 50px;">
            <h2 style="margin-top: 15px;">{{ $sentMail->subject }}</h2>
        </div>
        
        <div class="body-content">
            {!! nl2br(e($sentMail->body)) !!}
        </div>

        <div style="margin-top: 30px; text-align: center;">
            <a href="{{ url('/external/login') }}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
                {{ $sentMail->type === 'request' ? 'Upload Requested File' : 'Access Your Portal' }}
            </a>
        </div>

        <div class="footer">
            <p>Sent by: {{ $sentMail->sender->name }} ({{ $sentMail->sender->email }})</p>
            <p>This mail was processed and approved through the Internal File Sharing System.</p>
        </div>
    </div>
</body>
</html>
