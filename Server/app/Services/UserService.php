<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    protected $auditLog;

    public function __construct(AuditLogService $auditLog)
    {
        $this->auditLog = $auditLog;
    }

    public function getAllUsers()
    {
        return User::all();
    }

    public function createUser(array $data)
    {
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        $this->auditLog->log('Create User', "Created user {$user->email} with role {$user->role}");

        return $user;
    }

    public function createAdmin(array $data)
    {
        $data['role'] = 'admin';
        $data['is_active'] = true;
        $data['password'] = Hash::make($data['password']);
        
        $admin = User::create($data);

        $this->auditLog->log('Create Admin', "Created admin account {$admin->email}");

        return $admin;
    }

    public function updateUser(int $id, array $data)
    {
        $user = User::findOrFail($id);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        $user->refresh();

        $this->auditLog->log('Update User', "Updated user ID {$user->id} ({$user->email})");

        return $user;
    }

    public function toggleUserStatus(int $id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        $action = $user->is_active ? 'Admin account activated' : 'Admin account disabled';
        $this->auditLog->log('Toggle User Status', $action . " for ID {$id}");

        return $user;
    }

    public function changePassword(User $user, string $oldPassword, string $newPassword)
    {
        if (!Hash::check($oldPassword, $user->password)) {
            throw new \Exception('The provided old password does not match our records.', 422);
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        $this->auditLog->log('Change Password', "User {$user->email} changed their password");

        return true;
    }
}
