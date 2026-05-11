<?php

namespace App\Services;

use App\Models\Channel;
use App\Services\AuditLogService;

class ChannelService
{
    protected $auditLog;

    public function __construct(AuditLogService $auditLog)
    {
        $this->auditLog = $auditLog;
    }

    public function getAll()
    {
        return Channel::all();
    }

    public function findById($id)
    {
        return Channel::with('reasons')->findOrFail($id);
    }

    public function create(array $data)
    {
        $channel = Channel::create($data);
        $this->auditLog->log('Create Channel', "Created channel: {$channel->name}");
        return $channel;
    }

    public function update($id, array $data)
    {
        $channel = Channel::findOrFail($id);
        $channel->update($data);
        $this->auditLog->log('Update Channel', "Updated channel: {$channel->name} (ID: {$id})");
        return $channel;
    }

    public function delete($id)
    {
        $channel = Channel::findOrFail($id);
        $name = $channel->name;
        $channel->delete();
        $this->auditLog->log('Delete Channel', "Deleted channel: {$name} (ID: {$id})");
        return true;
    }
}
