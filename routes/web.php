<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\OTPController;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('portal/login', [OTPController::class, 'showPortalLogin'])->name('portal.login');
    Route::post('otp/send', [OTPController::class, 'sendOTP'])->name('otp.send.mail');
    Route::post('otp/verify', [OTPController::class, 'verifyOTP'])->name('otp.verify.mail');
});

// External status update webhook
Route::post('/api/transfers/{id}/status-update', [\App\Http\Controllers\FileRequestController::class, 'updateStatus'])->name('api.transfers.status_update');

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        $role = $user->role?->slug;
        if ($role === 'admin') return redirect()->route('manage.dashboard');
        if (in_array($role, ['employee', 'hod'])) return redirect()->route('employee.dashboard');
        return redirect()->route('external.dashboard');
    }
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Shared Dashboard access
    Route::get('/employee/dashboard', [\App\Http\Controllers\DashboardController::class, 'employee'])
        ->name('employee.dashboard')
        ->middleware('permission:dashboard.view');
        
    Route::get('/external/dashboard', [\App\Http\Controllers\DashboardController::class, 'external'])
        ->name('external.dashboard')
        ->middleware('permission:dashboard.view');

    // File Transfers
    Route::get('/transfers/compose', [\App\Http\Controllers\FileRequestController::class, 'create'])
        ->name('transfers.compose')
        ->middleware('permission:transfers.compose');
        
    Route::get('/transfers/approvals', [\App\Http\Controllers\FileRequestController::class, 'approvalsIndex'])
        ->name('transfers.approvals')
        ->middleware('permission:approvals.view');
        
    Route::post('/transfers', [\App\Http\Controllers\FileRequestController::class, 'store'])
        ->name('transfers.store')
        ->middleware('permission:transfers.compose');
        
    Route::get('/transfers/{transfer}', [\App\Http\Controllers\FileRequestController::class, 'show'])
        ->name('transfers.show')
        ->middleware('auth'); // Access controlled by logic in controller

    Route::get('/api/users/receivers', [\App\Http\Controllers\FileRequestController::class, 'getReceivers'])->name('api.users.receivers');
    Route::get('/api/users/approvers', [\App\Http\Controllers\FileRequestController::class, 'getApprovers'])->name('api.users.approvers');
    Route::get('/api/users/internal', [\App\Http\Controllers\FileRequestController::class, 'getInternalUsers'])->name('api.users.internal');

    Route::get('/mails/{mail}', [\App\Http\Controllers\MailController::class, 'show'])->name('mails.show');
    Route::post('/api/mails', [\App\Http\Controllers\MailController::class, 'store'])->name('mails.store');
    Route::get('/mails/{mail}/download/{index}', [\App\Http\Controllers\MailController::class, 'download'])->name('mails.download');

    Route::post('/transfers/{transfer}/approve', [\App\Http\Controllers\FileRequestController::class, 'approve'])->name('transfers.approve')->middleware('permission:approvals.view');
    Route::post('/transfers/{transfer}/reject', [\App\Http\Controllers\FileRequestController::class, 'reject'])->name('transfers.reject')->middleware('permission:approvals.view');
    Route::get('/transfers/download/{id}', [\App\Http\Controllers\FileRequestController::class, 'download'])->name('transfers.download')->middleware('signed');

    // External Portal
    Route::get('/tickets/upload', [\App\Http\Controllers\TicketController::class, 'index'])->name('tickets.upload')->middleware('permission:tickets.upload');
    Route::post('/tickets/{transfer}/upload', [\App\Http\Controllers\TicketController::class, 'upload'])->name('tickets.submit_upload')->middleware('permission:tickets.upload');

    // Profile & Inbox
    Route::get('/inbox', [\App\Http\Controllers\InboxController::class, 'index'])->name('inbox.index')->middleware('permission:inbox.view');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Management/Global Flow features (Permission Based)
    Route::get('/manage/dashboard', [AdminController::class, 'dashboard'])->name('manage.dashboard')->middleware('permission:dashboard.view');
    Route::get('/manage/users/{role?}', [AdminController::class, 'users'])->name('manage.users')->middleware('permission:admin.users');
    Route::post('/manage/users', [AdminController::class, 'storeUser'])->name('manage.users.store')->middleware('permission:admin.users');
    Route::patch('/manage/users/{user}/role', [AdminController::class, 'updateUserRole'])->name('manage.users.update_role')->middleware('permission:admin.users');
    Route::delete('/manage/users/{user}', [AdminController::class, 'deleteUser'])->name('manage.users.delete')->middleware('permission:admin.users');
    Route::get('/manage/transfers', [AdminController::class, 'transfers'])->name('manage.transfers')->middleware('permission:admin.transfers');
    
    Route::get('/manage/roles', [AdminController::class, 'roles'])->name('manage.roles')->middleware('permission:admin.roles');
    Route::post('/manage/roles', [AdminController::class, 'storeRole'])->name('manage.roles.store')->middleware('permission:admin.roles');
    Route::patch('/manage/roles/{role}/permissions', [AdminController::class, 'updateRolePermissions'])->name('manage.roles.update_permissions')->middleware('permission:admin.roles');
    Route::delete('/manage/roles/{role}', [AdminController::class, 'deleteRole'])->name('manage.roles.delete')->middleware('permission:admin.roles');

    Route::get('/manage/approval-categories', [AdminController::class, 'approvalCategories'])->name('manage.approval_categories')->middleware('permission:admin.approval_categories');
    Route::post('/manage/approval-categories', [AdminController::class, 'storeApprovalCategory'])->name('manage.approval_categories.store')->middleware('permission:admin.approval_categories');
    Route::patch('/manage/approval-categories/{id}/approvers', [AdminController::class, 'updateCategoryApprovers'])->name('manage.approval_categories.update_approvers')->middleware('permission:admin.approval_categories');
    Route::delete('/manage/approval-categories/{id}', [AdminController::class, 'deleteApprovalCategory'])->name('manage.approval_categories.delete')->middleware('permission:admin.approval_categories');
});

// Signed routes for email 1-click actions
Route::middleware('signed')->group(function () {
    Route::get('/transfers/{transfer}/signed-approve', [\App\Http\Controllers\FileRequestController::class, 'signedApprove'])->name('transfers.signed_approve');
    Route::get('/transfers/{transfer}/signed-reject', [\App\Http\Controllers\FileRequestController::class, 'signedReject'])->name('transfers.signed_reject');
    Route::get('/transfers/{transfer}/signed-download', [\App\Http\Controllers\FileRequestController::class, 'signedDownload'])->name('transfers.signed_download');
});

require __DIR__.'/auth.php';

use App\Http\Controllers\ExternalAuthController;
use App\Http\Controllers\ExternalPortalController;

Route::get('/external/login', function () {
    return Inertia::render('ExternalAuth/Login');
})->name('external.login');

Route::post('/external/otp-send', [ExternalAuthController::class, 'sendOtp'])
     ->name('external.otp.send');

Route::post('/external/otp-verify', [ExternalAuthController::class, 'verifyOtp'])
     ->name('external.otp.verify');

Route::middleware('external.auth')->group(function () {
    Route::get('/external/inbox', [ExternalPortalController::class, 'inbox'])
         ->name('external.inbox');
    Route::get('/external/mails/{id}', [ExternalPortalController::class, 'show'])
         ->name('external.mail.show');
    Route::post('/external/mails/{id}/request-download-otp',
         [ExternalPortalController::class, 'requestDownloadOtp'])
         ->name('external.download.otp');
    Route::post('/external/mails/{id}/download',
         [ExternalPortalController::class, 'download'])
         ->name('external.download');
    Route::post('/external/logout', [ExternalAuthController::class, 'logout'])
         ->name('external.logout');
});
