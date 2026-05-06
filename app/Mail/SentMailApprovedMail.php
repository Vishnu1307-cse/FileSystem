<?php

namespace App\Mail;

use App\Models\SentMail;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class SentMailApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $sentMail;
    public $credentialPassword;

    public function __construct(SentMail $sentMail, string $credentialPassword = null)
    {
        $this->sentMail = $sentMail;
        $this->credentialPassword = $credentialPassword;
        if ($credentialPassword) {
            $sentMail->update(['plain_credential_password' => $credentialPassword]);
        }
    }

    public function envelope(): Envelope
    {
        $cc = [];
        if (!empty($this->sentMail->cc)) {
            $cc = array_map('trim', explode(',', $this->sentMail->cc));
            // Filter out empty entries
            $cc = array_filter($cc);
        }

        return new Envelope(
            subject: $this->sentMail->subject,
            cc: $cc,
        );
    }

    public function content(): Content
    {
        $loginUrl = url('/external/login');
        
        $content = $this->sentMail->type === 'request'
            ? "Hello,\n\nAn employee has requested a file from you.\n\nSubject: {$this->sentMail->subject}\n\nPlease log in to the portal to upload the requested file.\n\nUse your registered email address to log in with a one-time code."
            : "Hello,\n\nA file has been sent to you.\n\nSubject: {$this->sentMail->subject}\n\nIn order to view it, please log in to the portal using the button below.";

        return new Content(
            view: 'emails.generic_notification',
            with: [
                'content' => $content,
                'actionUrl' => $loginUrl,
                'actionText' => $this->sentMail->type === 'request' ? 'Upload File' : 'Access Portal',
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
