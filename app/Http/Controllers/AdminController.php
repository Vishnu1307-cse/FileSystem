<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\FileRequest;
use App\Models\TicketRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'total_transfers' => FileRequest::count() + TicketRequest::count(),
                'pending_approvals' => FileRequest::where('status', 'pending')->count() + TicketRequest::where('status', 'pending')->count(),
            ]
        ]);
    }

    public function users(Request $request, $roleSlug = null)
    {
        $search = $request->query('search');
        $query = User::with(['hod', 'role']);

        if ($roleSlug) {
            $query->whereHas('role', function($q) use ($roleSlug) {
                if ($roleSlug === 'internal') {
                    $q->whereIn('slug', ['employee', 'hod']);
                } else {
                    $q->where('slug', $roleSlug);
                }
            });
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Admin/Users', [
            'users' => $query->latest()->get(),
            'hods' => User::whereHas('role', fn($q) => $q->where('slug', 'hod'))->get(),
            'availableRoles' => Role::all(),
            'filters' => [
                'role' => $roleSlug,
                'search' => $search
            ]
        ]);
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'hod_id' => 'nullable|exists:users,id'
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role_id' => $request->role_id,
            'hod_id' => $request->hod_id,
        ]);

        return back()->with('success', 'User created successfully.');
    }

    public function updateUserRole(Request $request, User $user)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'hod_id' => 'nullable|exists:users,id'
        ]);

        $user->update($request->only('role_id', 'hod_id'));

        return back()->with('success', 'User role updated successfully.');
    }

    public function roles()
    {
        return Inertia::render('Admin/Roles', [
            'roles' => Role::with('permissions')->get(),
            'permissions' => Permission::all()
        ]);
    }

    public function storeRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        $role = Role::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name)
        ]);

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return back()->with('success', 'Role created successfully.');
    }

    public function updateRolePermissions(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        $role->permissions()->sync($request->permissions);

        return back()->with('success', 'Role permissions updated.');
    }

    public function deleteRole(Role $role)
    {
        if ($role->users()->count() > 0) {
            return back()->with('error', 'Cannot delete role with assigned users.');
        }

        if (in_array($role->slug, ['admin', 'employee', 'customer', 'vendor', 'hod'])) {
            return back()->with('error', 'Core roles cannot be deleted.');
        }

        $role->delete();
        return back()->with('success', 'Role deleted.');
    }

    public function transfers()
    {
        $fileTransfers = \App\Models\FileRequest::with(['sender', 'receiver', 'approver'])->get();
        $ticketTransfers = \App\Models\TicketRequest::with(['sender', 'receiver', 'approver'])->get();
        $mails = \App\Models\SentMail::with(['sender', 'trackers'])->get();

        $mapItem = function ($item) {
            $isTicket = $item instanceof \App\Models\TicketRequest;
            $isMail = $item instanceof \App\Models\SentMail;

            if ($isMail) {
                $item->is_mail = true;
                $item->is_ticket = false;
                $item->status = $item->overall_status;
                // Standardize receiver for table
                $item->receiver_display = $item->getRawOriginal('receiver');
                $item->sender_display = $item->sender?->email ?? 'System';
            } else {
                $item->is_mail = false;
                $item->is_ticket = $isTicket;
                $item->sender_display = $item->sender?->email;
                $item->receiver_display = $item->receiver?->email;
            }
            return $item;
        };

        $combined = $fileTransfers->map($mapItem)
            ->concat($ticketTransfers->map($mapItem))
            ->concat($mails->map($mapItem))
            ->sortByDesc('created_at')
            ->values();

        return Inertia::render('Admin/Transfers', [
            'transfers' => $combined
        ]);
    }

    public function deleteUser(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete yourself.');
        }

        $user->delete();
        return back()->with('success', 'User deleted successfully.');
    }

    public function approvalCategories()
    {
        return Inertia::render('Admin/ApprovalCategories', [
            'categories' => \App\Models\ApprovalCategory::with('sequences.user')->get(),
            'internalUsers' => User::whereHas('role', fn($q) => $q->whereIn('slug', ['employee', 'hod']))->get(['id', 'name', 'email'])
        ]);
    }

    public function storeApprovalCategory(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:approval_categories']);
        \App\Models\ApprovalCategory::create(['name' => $request->name]);
        return back()->with('success', 'Category created.');
    }

    public function updateCategoryApprovers(Request $request, $id)
    {
        $request->validate([
            'approvers' => 'required|array',
            'approvers.*.user_id' => 'required|exists:users,id',
        ]);

        $category = \App\Models\ApprovalCategory::findOrFail($id);

        DB::beginTransaction();
        try {
            $category->sequences()->delete();
            foreach ($request->approvers as $index => $approver) {
                $category->sequences()->create([
                    'user_id' => $approver['user_id'],
                    'order_position' => $index + 1
                ]);
            }
            DB::commit();
            return back()->with('success', 'Approvers updated.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Update failed.');
        }
    }

    public function deleteApprovalCategory($id)
    {
        \App\Models\ApprovalCategory::findOrFail($id)->delete();
        return back()->with('success', 'Category deleted.');
    }

    public function settings()
    {
        $settings = \App\Models\SiteSetting::firstOrCreate([], [
            'file_expiration_days' => 0,
            'file_expiration_hours' => 0,
        ]);

        return Inertia::render('Admin/Settings', [
            'settings' => $settings
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'file_expiration_days' => 'required|integer|min:0',
            'file_expiration_hours' => 'required|integer|min:0|max:23',
        ]);

        $settings = \App\Models\SiteSetting::first();
        if (!$settings) {
            $settings = new \App\Models\SiteSetting();
        }

        $settings->fill($request->only(['file_expiration_days', 'file_expiration_hours']));
        $settings->save();

        return back()->with('success', 'Settings updated successfully.');
    }
}
