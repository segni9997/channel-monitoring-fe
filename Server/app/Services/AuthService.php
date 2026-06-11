<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Services\AuditLogService;

class AuthService
{
    protected $auditLog;

    public function __construct(AuditLogService $auditLog)
    {
        $this->auditLog = $auditLog;
    }

    /**
     * Authenticate a user and return a token.
     */
    public function login(string $email, string $password, array $allowedRoles, string $tokenName)
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password'],
            ]);
        }

        if (!in_array($user->role, $allowedRoles)) {
            throw new \Exception("Unauthorized access for this role.", 403);
        }

        if (!$user->is_active) {
            throw new \Exception("Account disabled. Please contact the administrator.", 403);
        }

        $token = $user->createToken($tokenName)->plainTextToken;

        $roleLabel = ucfirst($user->role);
        $this->auditLog->log("{$roleLabel} Login", "{$roleLabel} {$user->email} logged in", $user->id);

        return [
            'user' => $user,
            'token' => $token
        ];
    }
}
