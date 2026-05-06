<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupExpiredFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-expired-files';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $settings = \App\Models\SiteSetting::first();
        if (!$settings || ($settings->file_expiration_days == 0 && $settings->file_expiration_hours == 0)) {
            $this->info("No expiration timer set. Skipping.");
            return;
        }

        $days = $settings->file_expiration_days;
        $hours = $settings->file_expiration_hours;

        $expiredMails = \App\Models\SentMail::where(function($query) {
                $query->whereNotNull('attachments')
                      ->where('attachments', '!=', '[]')
                      ->where('attachments', '!=', '');
            })
            ->get()
            ->filter(function($mail) use ($days, $hours) {
                $expiryTime = $mail->created_at->addDays($days)->addHours($hours);
                return $expiryTime->isPast();
            });

        $count = 0;
        foreach ($expiredMails as $mail) {
            $attachments = $mail->attachments ?? [];
            foreach ($attachments as $path) {
                if (\Illuminate\Support\Facades\Storage::disk('local')->exists($path)) {
                    \Illuminate\Support\Facades\Storage::disk('local')->delete($path);
                }
            }

            $mail->update(['attachments' => []]);
            $count++;
            $this->info("Cleaned up mail ID: {$mail->id}");
        }

        $this->info("Total expired mails cleaned: {$count}");
    }
}
