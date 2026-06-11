<?php

namespace App\Services;

use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Log;

class AuditLogService
{
    /**
     * Log an activity to the system_logs table.
     */
    public function log(string $action, $details = null, ?int $userId = null, $oldValues = null, $newValues = null): void
    {
        try {
            $user = $userId ? User::find($userId) : Auth::user();
            $userName = $user ? $user->firstName . ' ' . $user->lastName : 'System';

            SystemLog::create([
                'user_id' => $user ? $user->id : null,
                'user_name' => $userName,
                'action' => $action,
                'details' => $details,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log activity: " . $e->getMessage());
        }
    }
}
