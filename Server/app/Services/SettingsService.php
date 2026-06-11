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
        if (!isset($settings['shift_start_time'])) {
            $settings['shift_start_time'] = null;
        } else {
            // Return only the time portion to the user
            $settings['shift_start_time'] = \Carbon\Carbon::parse($settings['shift_start_time'])->format('H:i:s');
        }

        if (!isset($settings['global_shift_start_time'])) {
            $settings['global_shift_start_time'] = '00:00:00';
        }

        return $settings;
    }

    public function updateSettings(array $data)
    {
        $oldValues = [];
        foreach ($data as $key => $value) {
            $setting = SystemSetting::where('key', $key)->first();
            $oldValues[$key] = $setting ? $setting->value : null;
            SystemSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        $this->auditLog->log('Update Settings', "Updated system settings", null, $oldValues, $data);
        return true;
    }

    public function startGlobalShift(?string $startTime = null)
    {
        $shiftTimeSetting = SystemSetting::where('key', 'shift_time')->first();
        $shiftHours = $shiftTimeSetting ? (int) $shiftTimeSetting->value : 24;

        $now = $startTime ? \Carbon\Carbon::parse($startTime) : now();

        // Close any overlapping previous shifts
        \App\Models\Shift::where('end_time', '>', $now)
            ->update(['end_time' => $now]);

        // Create new shift
        \App\Models\Shift::create([
            'start_time' => $now,
            'end_time' => $now->copy()->addHours($shiftHours),
        ]);

        $formattedStartTime = $now->toDateTimeString();
        SystemSetting::updateOrCreate(
            ['key' => 'shift_start_time'],
            ['value' => $formattedStartTime]
        );
        $this->auditLog->log('Start Global Shift', "A new global shift was started at " . $formattedStartTime);
        return $formattedStartTime;
    }
}
