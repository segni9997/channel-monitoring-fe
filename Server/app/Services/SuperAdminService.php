<?php

namespace App\Services;

use App\Models\SystemLog;

class SuperAdminService
{
    public function getActivityLogs(array $filters, int $perPage = 50)
    {
        $query = SystemLog::with('user')->orderBy('created_at', 'desc');

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', 'like', '%' . $filters['action'] . '%');
        }

        return $query->paginate($perPage);
    }
}
