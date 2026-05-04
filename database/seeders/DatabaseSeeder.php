<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // First setup RBAC
        $this->call(RolePermissionSeeder::class);
        $this->call(SiteSettingSeeder::class);

        $adminRole = Role::where('slug', 'admin')->first();
        $hodRole = Role::where('slug', 'hod')->first();
        $employeeRole = Role::where('slug', 'employee')->first();
        $vendorRole = Role::where('slug', 'vendor')->first();
        $customerRole = Role::where('slug', 'customer')->first();

        // Create Admin
        User::factory()->create([
            'name' => 'System Administrator',
            'email' => 'admin@example.com',
            'role_id' => $adminRole->id,
        ]);

        // Create HOD
        $hod = User::factory()->create([
            'name' => 'Department Head',
            'email' => 'hod@example.com',
            'role_id' => $hodRole->id,
        ]);

        // Create Employee linked to HOD
        User::factory()->create([
            'name' => 'Normal Employee',
            'email' => 'employee@example.com',
            'role_id' => $employeeRole->id,
            'hod_id' => $hod->id,
        ]);

        // Create Specialized Approvers (Now just regular employees or we could make more roles)
        User::factory()->create([
            'name' => 'Hardware Specialist',
            'email' => 'hardware@example.com',
            'role_id' => $employeeRole->id,
        ]);

        User::factory()->create([
            'name' => 'Software Specialist',
            'email' => 'software@example.com',
            'role_id' => $employeeRole->id,
        ]);

        // Create External Users
        User::factory()->create([
            'name' => 'Example Vendor',
            'email' => 'vendor@example.com',
            'role_id' => $vendorRole->id,
        ]);

        User::factory()->create([
            'name' => 'Example Customer',
            'email' => 'customer@example.com',
            'role_id' => $customerRole->id,
        ]);
    }
}
