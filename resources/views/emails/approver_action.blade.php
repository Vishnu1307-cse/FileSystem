<!DOCTYPE html>
<html>
<head>
    <title>Action Required</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Action Required: File Transfer Approval</h2>
    <p>You have a new file transfer pending your approval.</p>

    <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
        <p><strong>Sender:</strong> {{ $transfer->sender->email }}</p>
        <p><strong>Receiver:</strong> {{ $transfer->receiver->email }}</p>
        <p><strong>Message:</strong> {{ $transfer->message ?? 'No message provided.' }}</p>
    </div>

    <p>You can temporarily view or download the file here to review it before making a decision:</p>
    <p>
        <a href="{{ $downloadUrl }}" style="padding: 10px 15px; background-color: #f3f4f6; color: #374151; text-decoration: none; border-radius: 3px; font-weight: bold; border: 1px solid #d1d5db;">Preview / Download File</a>
    </p>

    <p style="margin-top: 30px;"><strong>Action Required:</strong></p>
    <div style="display: flex; gap: 10px;">
        <a href="{{ $approveUrl }}" style="padding: 12px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-right: 15px;">Approve Transfer</a>
        
        <a href="{{ $rejectUrl }}" style="padding: 12px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reject Transfer</a>
    </div>
    <p style="font-size: 12px; color: #999; margin-top: 30px;">If you reject this transfer, the file will be securely and permanently deleted from the system.</p>
</body>
</html>
