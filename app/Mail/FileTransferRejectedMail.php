<?php

namespace App\Mail;

use App\Models\FileRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FileTransferRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $transfer;

    public function __construct(FileRequest $transfer)
    {
        $this->transfer = $transfer;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'File Transfer Rejected',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.transfer_rejected',
        );
    }
}
