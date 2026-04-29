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
    Route::post('otp/send', [OTPController::class, 'sendOTP'])->name('otp.send');
    Route::post('otp/verify', [OTPController::class, 'verifyOTP'])->name('otp.verify');
});

// External status update webhook
Route::post('/api/transfers/{id}/status-update', [\App\Http\Controllers\FileRequestController::class, 'updateStatus'])->name('api.transfers.status_update');

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        $role = $user->role?->slug;
        if ($role === 'admin') return redirect()->route('admin.dashboard');
        if (in_array($role, ['employee', 'hod'])) return redirect()->route('employee.dashboard');
        return redirect()->route('external.dashboard');
    }
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Shared Dashboard access
    Route::get('/employee/dashboard', [\App\Http\Controllers\DashboardController::class, 'employee'])
        ->name('employee.dashboard')
        ->middleware('can:dashboard.view');
        
    Route::get('/external/dashboard', [\App\Http\Controllers\DashboardController::class, 'external'])
        ->name('external.dashboard')
        ->middleware('can:dashboard.view');

    // File Transfers
    Route::get('/transfers/compose', [\App\Http\Controllers\FileRequestController::class, 'create'])
        ->name('transfers.compose')
        ->middleware('can:transfers.compose');
        
    Route::get('/transfers/approvals', [\App\Http\Controllers\FileRequestController::class, 'approvalsIndex'])
        ->name('transfers.approvals')
        ->middleware('can:approvals.view');
        
    Route::post('/transfers', [\App\Http\Controllers\FileRequestController::class, 'store'])
        ->name('transfers.store')
        ->middleware('can:transfers.compose');
        
    Route::get('/transfers/{transfer}', [\App\Http\Controllers\FileRequestController::class, 'show'])
        ->name('transfers.show')
        ->middleware('auth'); // Access controlled by logic in controller

    Route::get('/api/users/receivers', [\App\Http\Controllers\FileRequestController::class, 'getReceivers'])->name('api.users.receivers');
    Route::get('/api/users/approvers', [\App\Http\Controllers\FileRequestController::class, 'getApprovers'])->name('api.users.approvers');
    Route::get('/api/users/internal', [\App\Http\Controllers\FileRequestController::class, 'getInternalUsers'])->name('api.users.internal');

    Route::post('/transfers/{transfer}/approve', [\App\Http\Controllers\FileRequestController::class, 'approve'])->name('transfers.approve')->middleware('can:approvals.view');
    Route::post('/transfers/{transfer}/reject', [\App\Http\Controllers\FileRequestController::class, 'reject'])->name('transfers.reject')->middleware('can:approvals.view');
    Route::get('/transfers/download/{id}', [\App\Http\Controllers\FileRequestController::class, 'download'])->name('transfers.download')->middleware('signed');

    // External Portal
    Route::get('/tickets/upload', [\App\Http\Controllers\TicketController::class, 'index'])->name('tickets.upload')->middleware('can:tickets.upload');
    Route::post('/tickets/{transfer}/upload', [\App\Http\Controllers\TicketController::class, 'upload'])->name('tickets.submit_upload')->middleware('can:tickets.upload');

    // Profile & Inbox
    Route::get('/inbox', [\App\Http\Controllers\InboxController::class, 'index'])->name('inbox.index')->middleware('can:inbox.view');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Signed routes for email 1-click actions
Route::middleware('signed')->group(function () {
    Route::get('/transfers/{transfer}/signed-approve', [\App\Http\Controllers\FileRequestController::class, 'signedApprove'])->name('transfers.signed_approve');
    Route::get('/transfers/{transfer}/signed-reject', [\App\Http\Controllers\FileRequestController::class, 'signedReject'])->name('transfers.signed_reject');
    Route::get('/transfers/{transfer}/signed-download', [\App\Http\Controllers\FileRequestController::class, 'signedDownload'])->name('transfers.signed_download');
});

// Admin Dedicated Routes
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/users/{role?}', [AdminController::class, 'users'])->name('admin.users');
    Route::post('/admin/users', [AdminController::class, 'storeUser'])->name('admin.users.store');
    Route::patch('/admin/users/{user}/role', [AdminController::class, 'updateUserRole'])->name('admin.users.update_role');
    Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser'])->name('admin.users.delete');
    Route::get('/admin/transfers', [AdminController::class, 'transfers'])->name('admin.transfers');
    
    // Role & Permission Management
    Route::get('/admin/roles', [AdminController::class, 'roles'])->name('admin.roles');
    Route::post('/admin/roles', [AdminController::class, 'storeRole'])->name('admin.roles.store');
    Route::patch('/admin/roles/{role}/permissions', [AdminController::class, 'updateRolePermissions'])->name('admin.roles.update_permissions');
    Route::delete('/admin/roles/{role}', [AdminController::class, 'deleteRole'])->name('admin.roles.delete');

    // Approval Table Management
    Route::get('/admin/approval-categories', [AdminController::class, 'approvalCategories'])->name('admin.approval_categories');
    Route::post('/admin/approval-categories', [AdminController::class, 'storeApprovalCategory'])->name('admin.approval_categories.store');
    Route::patch('/admin/approval-categories/{id}/approvers', [AdminController::class, 'updateCategoryApprovers'])->name('admin.approval_categories.update_approvers');
    Route::delete('/admin/approval-categories/{id}', [AdminController::class, 'deleteApprovalCategory'])->name('admin.approval_categories.delete');
});

require __DIR__.'/auth.php';
