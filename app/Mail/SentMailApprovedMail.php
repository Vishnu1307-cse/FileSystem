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

    public function __construct(SentMail $sentMail)
    {
        $this->sentMail = $sentMail;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->sentMail->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.sent_mail_approved',
        );
    }

    public function attachments(): array
    {
        $attachments = [];
        
        if ($this->sentMail->attachments && is_array($this->sentMail->attachments)) {
            foreach ($this->sentMail->attachments as $path) {
                if (Storage::disk('local')->exists($path)) {
                    $attachments[] = Attachment::fromPath(Storage::disk('local')->path($path));
                }
            }
        }
        
        return $attachments;
    }
}
