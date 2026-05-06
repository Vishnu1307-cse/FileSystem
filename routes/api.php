<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MailController;

Route::post('/mails', [MailController::class, 'store'])
       ->middleware('auth:sanctum');

use App\Http\Controllers\WebhookController;
Route::post('/webhooks/mail-approval', [WebhookController::class, 'mailApproval']);

use App\Http\Controllers\SendFileController;
Route::post('/send-files', [SendFileController::class, 'store'])->middleware('auth:sanctum');

Route::post('/webhooks/send-file-approval', [App\Http\Controllers\WebhookController::class, 'sendFileApproval']);

use App\Http\Controllers\InternalApprovalController;
Route::post('/internal-approval/act', [InternalApprovalController::class, 'act'])
     ->middleware('web', 'auth');

use App\Http\Controllers\InternalApprovalWebhookController;
Route::post('/webhooks/internal-approval', 
    [InternalApprovalWebhookController::class, 'handle']);
