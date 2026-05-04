<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Define Permissions
        $permissions = [
            'dashboard.view' => 'Access Dashboard',
            'inbox.view' => 'View Inbox',
            'transfers.compose' => 'Compose File Transfers',
            'approvals.view' => 'Manage Approvals',
            'admin.users' => 'Manage Users',
            'admin.transfers' => 'Global Transfer Monitor',
            'admin.roles' => 'Manage Roles & Permissions',
            'admin.approval_categories' => 'Manage Approval Sequences',
            'tickets.upload' => 'Upload Ticket Files',
        ];

        foreach ($permissions as $slug => $name) {
            Permission::updateOrCreate(['slug' => $slug], ['name' => $name]);
        }

        // Define Roles & Assign Permissions
        $roleStructure = [
            'admin' => [
                'name' => 'System Administrator',
                'permissions' => array_keys($permissions)
            ],
            'hod' => [
                'name' => 'Head of Department',
                'permissions' => ['dashboard.view', 'inbox.view', 'transfers.compose', 'approvals.view']
            ],
            'employee' => [
                'name' => 'Employee',
                'permissions' => ['dashboard.view', 'inbox.view', 'transfers.compose', 'approvals.view']
            ],
            'vendor' => [
                'name' => 'Vendor',
                'permissions' => ['dashboard.view', 'inbox.view', 'tickets.upload']
            ],
            'customer' => [
                'name' => 'Customer',
                'permissions' => ['dashboard.view', 'inbox.view', 'tickets.upload']
            ],
        ];

        foreach ($roleStructure as $slug => $data) {
            $role = Role::updateOrCreate(['slug' => $slug], ['name' => $data['name']]);
            $permissionIds = Permission::whereIn('slug', $data['permissions'])->pluck('id');
            $role->permissions()->sync($permissionIds);
        }

        // Migrate Existing Users (Safety check for legacy columns if still present)
        User::chunk(100, function ($users) {
            foreach ($users as $user) {
                // If user already has a role_id, don't overwrite it unless needed
                if ($user->role_id) continue;

                $targetSlug = 'employee'; // Default
                
                // Logic for older users before the RBAC transition
                if (isset($user->role)) {
                    $targetSlug = $user->role;
                    if ($user->role === 'employee' && ($user->super_role ?? '') === 'hod') {
                        $targetSlug = 'hod';
                    }
                }

                $role = Role::where('slug', $targetSlug)->first();
                if ($role) {
                    $user->update(['role_id' => $role->id]);
                }
            }
        });
    }
}
