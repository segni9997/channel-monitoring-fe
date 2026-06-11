<?php

namespace App\Services;

use App\Models\Branch;
use App\Services\AuditLogService;

class BranchService
{
    protected $auditLog;

    public function __construct(AuditLogService $auditLog)
    {
        $this->auditLog = $auditLog;
    }

    public function getAll()
    {
        return Branch::all();
    }

    public function findById($id)
    {
        return Branch::with('atms')->findOrFail($id);
    }

    public function createMany(array $data)
    {
        $created = [];
        foreach ($data as $item) {
            $created[] = Branch::create($item);
        }
        $this->auditLog->log('Create Branch', "Created " . count($created) . " branch(es)");
        return $created;
    }

    public function update($id, array $data)
    {
        $branch = Branch::findOrFail($id);
        $oldValues = $branch->only(array_keys($data));
        
        $branch->update($data);
        $newValues = $branch->refresh()->only(array_keys($data));

        $this->auditLog->log('Update Branch', "Updated branch: {$branch->name} (ID: {$id})", null, $oldValues, $newValues);
        return $branch;
    }

    public function delete($id)
    {
        $branch = Branch::findOrFail($id);
        $name = $branch->name;
        $branch->delete();
        $this->auditLog->log('Delete Branch', "Deleted branch: {$name} (ID: {$id})");
        return true;
    }
}
