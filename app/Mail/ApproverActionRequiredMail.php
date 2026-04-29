<?php

namespace App\Mail;

use App\Models\FileRequest;
use App\Models\TicketRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class ApproverActionRequiredMail extends Mailable
{
    use Queueable, SerializesModels;

    public $transfer;
    public $approveUrl;
    public $rejectUrl;
    public $downloadUrl;

    public function __construct(FileRequest|TicketRequest $transfer)
    {
        $this->transfer = $transfer;
        $this->approveUrl = URL::signedRoute('transfers.signed_approve', ['transfer' => $transfer->id]);
        $this->rejectUrl = URL::signedRoute('transfers.signed_reject', ['transfer' => $transfer->id]);
        $this->downloadUrl = URL::signedRoute('transfers.signed_download', ['transfer' => $transfer->id]);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Action Required: File Transfer Approval',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.approver_action',
        );
    }
}
