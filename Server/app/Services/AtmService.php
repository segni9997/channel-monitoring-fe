<?php

namespace App\Services;

use App\Models\Atm;
use App\Services\AuditLogService;

class AtmService
{
    protected $auditLog;

    public function __construct(AuditLogService $auditLog)
    {
        $this->auditLog = $auditLog;
    }

    public function getAll($branchId = null)
    {
        $query = Atm::with('branch');
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        return $query->get();
    }

    public function findById($id)
    {
        return Atm::with('branch')->findOrFail($id);
    }

    public function createMany(array $data)
    {
        $created = [];
        foreach ($data as $item) {
            $created[] = Atm::create($item);
        }
        $this->auditLog->log('Create ATM', "Created " . count($created) . " ATM(s)");
        return $created;
    }

    public function update($id, array $data)
    {
        $atm = Atm::findOrFail($id);
        $oldValues = $atm->only(array_keys($data));
        
        $atm->update($data);
        $newValues = $atm->refresh()->only(array_keys($data));

        $this->auditLog->log('Update ATM', "Updated ATM: {$atm->name} (ID: {$id})", null, $oldValues, $newValues);
        return $atm;
    }

    public function delete($id)
    {
        $atm = Atm::findOrFail($id);
        $name = $atm->name;
        $atm->delete();
        $this->auditLog->log('Delete ATM', "Deleted ATM: {$name} (ID: {$id})");
        return true;
    }
}
