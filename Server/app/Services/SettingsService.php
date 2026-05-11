<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Services\AuditLogService;

class SettingsService
{
    protected $auditLog;

    public function __construct(AuditLogService $auditLog)
    {
        $this->auditLog = $auditLog;
    }

    public function getAllSettings()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');
        if (!isset($settings['shift_time'])) {
            $settings['shift_time'] = '24';
        }
        return $settings;
    }

    public function updateSettings(array $data)
    {
        foreach ($data as $key => $value) {
            SystemSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        $this->auditLog->log('Update Settings', "Updated system settings: " . json_encode($data));
        return true;
    }
}
