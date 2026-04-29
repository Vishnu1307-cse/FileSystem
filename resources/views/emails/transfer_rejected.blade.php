<!DOCTYPE html>
<html>
<head>
    <title>File Transfer Rejected</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Your File Transfer Was Rejected</h2>
    <p>Unfortunately, your file transfer request to <strong>{{ $transfer->receiver->email }}</strong> has been rejected by the approver, <strong>{{ $transfer->approver->email }}</strong>.</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
        <p><strong>Original Message:</strong> {{ $transfer->message ?? 'No message provided.' }}</p>
    </div>

    <p>The file associated with this transfer has been permanently deleted from the secure database. If you need to send the file again, please submit a new request.</p>

    <p style="font-size: 12px; color: #999; margin-top: 30px;">Thank you for using the Secure File Sharing System.</p>
</body>
</html>
