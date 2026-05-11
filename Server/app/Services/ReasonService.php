<?php

namespace App\Services;

use App\Models\Reason;
use App\Services\AuditLogService;

class ReasonService
{
    protected $auditLog;

    public function __construct(AuditLogService $auditLog)
    {
        $this->auditLog = $auditLog;
    }

    public function getAll($channelId = null)
    {
        $query = Reason::with('channel');
        if ($channelId) {
            $query->where('channel_id', $channelId);
        }
        return $query->get();
    }

    public function findById($id)
    {
        return Reason::with('channel')->findOrFail($id);
    }

    public function create(array $data)
    {
        $reason = Reason::create($data);
        $this->auditLog->log('Create Reason', "Created reason: {$reason->name}");
        return $reason;
    }

    public function update($id, array $data)
    {
        $reason = Reason::findOrFail($id);
        $reason->update($data);
        $this->auditLog->log('Update Reason', "Updated reason: {$reason->name} (ID: {$id})");
        return $reason;
    }

    public function delete($id)
    {
        $reason = Reason::findOrFail($id);
        $name = $reason->name;
        $reason->delete();
        $this->auditLog->log('Delete Reason', "Deleted reason: {$name} (ID: {$id})");
        return true;
    }
}
