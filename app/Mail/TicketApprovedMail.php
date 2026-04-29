<?php

namespace App\Mail;

use App\Models\TicketRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $transfer;
    public $uploadUrl;

    public function __construct(TicketRequest $transfer)
    {
        $this->transfer = $transfer;
        $this->uploadUrl = route('otp.login');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Ticket Approved: Action Required',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket_approved',
        );
    }
}
