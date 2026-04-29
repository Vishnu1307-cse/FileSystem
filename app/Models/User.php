<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'hod_id',
        'otp',
        'otp_code',
        'otp_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'otp_expires_at' => 'datetime',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function permissions()
    {
        return $this->role ? $this->role->permissions() : collect();
    }

    public function hasPermission($permission)
    {
        if (!$this->role) return false;
        return $this->role->permissions()->where('slug', $permission)->exists();
    }

    public function hod()
    {
        return $this->belongsTo(User::class, 'hod_id');
    }

    public function employees()
    {
        return $this->hasMany(User::class, 'hod_id');
    }

    protected static function booted(): void
    {
        static::saving(function (User $user) {
            // Basic HOD logic for regular employees
            if ($user->role?->slug === 'employee' && is_null($user->hod_id)) {
                // Optional: enforce HOD for employees if needed
            }
        });
    }
}
