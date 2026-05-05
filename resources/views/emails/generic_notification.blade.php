<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { height: 50px; }
        .body-content { white-space: pre-wrap; background: #f9f9f9; padding: 20px; border-radius: 12px; margin-bottom: 30px; font-size: 14px; }
        .footer { font-size: 0.8em; color: #888; border-top: 1px solid #eee; padding-top: 15px; text-align: center; }
        .btn { background: #4f46e5; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ $message->embed(public_path('image.png')) }}" alt="Pricol Logo" class="logo">
        </div>
        
        <div class="body-content">{!! nl2br(e($content)) !!}</div>

        @if(isset($actionUrl))
        <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{ $actionUrl }}" class="btn">{{ $actionText ?? 'Access Portal' }}</a>
        </div>
        @endif

        <div class="footer">
            <p>This is an automated notification from the Pricol Internal File Sharing System.</p>
        </div>
    </div>
</body>
</html>
