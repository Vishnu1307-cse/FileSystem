<?php

use App\Models\SentMail;
use App\Models\MailApprovalTracker;
use App\Models\User;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$employee = User::where('email', 'employee@example.com')->first();
$hod = User::where('email', 'hod@example.com')->first();

if (!$employee) {
    echo "Employee not found\n";
    exit;
}

$mail = SentMail::create([
    'sender_id' => $employee->id,
    'receiver' => 'customer@example.com',
    'subject' => 'Official Test Mail',
    'body' => 'This is a test body for verification.',
    'overall_status' => 'pending'
]);

MailApprovalTracker::create([
    'mid' => $mail->id,
    'mail_id' => 'EXT-123',
    'level' => 1,
    'name' => 'Department Head',
    'email' => 'hod@example.com',
    'status' => 'approved'
]);

MailApprovalTracker::create([
    'mid' => $mail->id,
    'mail_id' => 'EXT-123',
    'level' => 2,
    'name' => 'Manager',
    'email' => 'manager@example.com',
    'status' => 'pending'
]);

echo "Test mail seeded successfully.\n";
