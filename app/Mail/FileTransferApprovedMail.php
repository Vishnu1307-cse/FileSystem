<?php

namespace App\Mail;

use App\Models\FileRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FileTransferApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $transfer;
    public $downloadUrl;

    public function __construct(FileRequest $transfer)
    {
        $this->transfer = $transfer;
        $this->downloadUrl = \Illuminate\Support\Facades\URL::signedRoute('transfers.download', ['id' => $transfer->id]);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'File Transfer Approved',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.transfer_approved',
        );
    }
}
