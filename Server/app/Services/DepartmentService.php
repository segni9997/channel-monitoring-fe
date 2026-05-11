<?php

namespace App\Services;

use App\Models\Department;
use App\Services\AuditLogService;

class DepartmentService
{
    protected $auditLog;

    public function __construct(AuditLogService $auditLog)
    {
        $this->auditLog = $auditLog;
    }

    public function getAll()
    {
        return Department::all();
    }

    public function findById($id)
    {
        return Department::findOrFail($id);
    }

    public function createMany(array $data)
    {
        $created = [];
        foreach ($data as $item) {
            $created[] = Department::create($item);
        }
        $this->auditLog->log('Create Department', "Created " . count($created) . " department(s)");
        return $created;
    }

    public function update($id, array $data)
    {
        $department = Department::findOrFail($id);
        $department->update($data);
        $this->auditLog->log('Update Department', "Updated department: {$department->name} (ID: {$id})");
        return $department;
    }

    public function delete($id)
    {
        $department = Department::findOrFail($id);
        $name = $department->name;
        $department->delete();
        $this->auditLog->log('Delete Department', "Deleted department: {$name} (ID: {$id})");
        return true;
    }
}
