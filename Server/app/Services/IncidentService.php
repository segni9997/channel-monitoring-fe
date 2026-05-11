<?php

namespace App\Services;

use App\Models\Incident;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use App\Services\AuditLogService;

class IncidentService
{
    protected $auditLog;

    public function __construct(AuditLogService $auditLog)
    {
        $this->auditLog = $auditLog;
    }

    public function getFilteredIncidents(array $filters)
    {
        $query = Incident::query();

        if (!empty($filters['from_date']) && !empty($filters['to_date'])) {
            $query->whereBetween('downTimeStart', [$filters['from_date'], $filters['to_date']]);
        } elseif (!empty($filters['from_date'])) {
            $query->where('downTimeStart', '>=', $filters['from_date']);
        } elseif (!empty($filters['to_date'])) {
            $query->where('downTimeStart', '<=', $filters['to_date']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['reason_id'])) {
            $query->where('reasonId', $filters['reason_id']);
        }

        if (!empty($filters['channel'])) {
            $query->where('channel', $filters['channel']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (!empty($filters['atm_id'])) {
            $query->where('atm_id', $filters['atm_id']);
        }

        return $query->with(['reason', 'creator', 'branch', 'atm'])->get();
    }

    public function storeIncident(array $data, bool $isAtm = false)
    {
        if ($data['status'] === 'completed' && !empty($data['downTimeEnd'])) {
            $data['duration'] = $this->calculateDuration($data['downTimeStart'], $data['downTimeEnd']);
        }

        $incident = Incident::create($data);

        $logAction = $isAtm ? 'Create ATM Incident' : 'Create Incident';
        $logDetails = $isAtm ? "Created incident ID {$incident->id} for ATM/Branch" : "Created incident ID {$incident->id} for channel {$incident->channel}";
        
        $this->auditLog->log($logAction, $logDetails);

        return $incident;
    }

    public function updateIncident(int $id, array $data, bool $isAdmin = false)
    {
        $incident = Incident::findOrFail($id);

        if ($incident->status === 'completed' && ($data['status'] ?? '') === 'completed') {
            throw new \Exception('This incident is already marked as completed.', 422);
        }

        $finalStatus = $data['status'] ?? $incident->status;
        $finalStart = $data['downTimeStart'] ?? $incident->downTimeStart;
        $finalEnd = $data['downTimeEnd'] ?? $incident->downTimeEnd;

        if ($finalStatus === 'completed' && !empty($finalEnd)) {
            $data['duration'] = $this->calculateDuration($finalStart, $finalEnd);
        }

        $incident->update($data);

        $logAction = $isAdmin ? 'Admin Edit Incident' : 'Update Incident';
        $this->auditLog->log($logAction, "Updated incident ID {$incident->id}");

        return $incident;
    }

    public function deleteIncident(int $id)
    {
        $incident = Incident::findOrFail($id);
        $incident->delete();

        $this->auditLog->log('Delete Incident', "Deleted incident ID {$id}");
        
        return true;
    }

    public function getDashboardSummary(?string $fromDate, ?string $toDate)
    {
        $query = Incident::query();

        if ($fromDate && $toDate) {
            $query->whereBetween('created_at', [
                Carbon::parse($fromDate)->startOfDay(),
                Carbon::parse($toDate)->endOfDay()
            ]);
        } elseif ($fromDate) {
            $query->where('created_at', '>=', Carbon::parse($fromDate)->startOfDay());
        } elseif ($toDate) {
            $query->where('created_at', '<=', Carbon::parse($toDate)->endOfDay());
        }

        $incidents = $query->get();

        $totalIncidents = $incidents->count();
        $pendingIncidents = $incidents->where('status', 'inprogress')->count();
        $completedIncidents = $incidents->where('status', 'completed')->count();

        $totalDownTime = $incidents->sum(fn($i) => (int) $i->duration);
        $atmTotalDownTime = $incidents->where('channel', 'ATM')->sum(fn($i) => (int) $i->duration);
        $otherTotalDownTime = $incidents->where('channel', '!=', 'ATM')->sum(fn($i) => (int) $i->duration);

        $downtimePerChannel = $incidents->groupBy('channel')->map(fn($group) => [
            'incident_count' => $group->count(),
            'total_downtime' => $group->sum(fn($i) => (int) $i->duration)
        ]);

        $incidentTrends = $incidents->groupBy(fn($i) => Carbon::parse($i->created_at)->format('Y-m-d'))
            ->map(fn($group) => $group->count());

        // Shift Time Logic
        $shiftTimeSetting = SystemSetting::where('key', 'shift_time')->first();
        $shiftTime = $shiftTimeSetting ? (int) $shiftTimeSetting->value : 24;

        $days = $this->calculateDays($fromDate, $toDate);
        $totalMonitoredMinutes = $days * $shiftTime * 60;

        $calculateUptime = function ($downTime) use ($totalMonitoredMinutes) {
            if ($totalMonitoredMinutes <= 0) return 0;
            return max(0, min(100, (($totalMonitoredMinutes - $downTime) / $totalMonitoredMinutes) * 100));
        };

        return [
            'total_incidents' => $totalIncidents,
            'pending_incidents' => $pendingIncidents,
            'completed_incidents' => $completedIncidents,
            'total_down_time' => $totalDownTime,
            'atm_total_down_time' => $atmTotalDownTime,
            'other_total_down_time' => $otherTotalDownTime,
            'total_uptime_percentage' => $calculateUptime($totalDownTime),
            'atm_uptime_percentage' => $calculateUptime($atmTotalDownTime),
            'other_uptime_percentage' => $calculateUptime($otherTotalDownTime),
            'shift_time' => $shiftTime,
            'monitored_days' => $days,
            'downtime_per_channel' => $downtimePerChannel,
            'incident_trends' => $incidentTrends,
            'from_date' => $fromDate,
            'to_date' => $toDate,
        ];
    }

    protected function calculateDuration($start, $end)
    {
        $start = Carbon::parse($start);
        $end = Carbon::parse($end);
        return $start->diffInMinutes($end) . ' mins';
    }

    protected function calculateDays(?string $fromDate, ?string $toDate)
    {
        if ($fromDate && $toDate) {
            return max(1, Carbon::parse($fromDate)->diffInDays(Carbon::parse($toDate)) + 1);
        } elseif ($fromDate) {
            return max(1, Carbon::parse($fromDate)->diffInDays(Carbon::now()) + 1);
        } else {
            $firstIncident = Incident::orderBy('created_at', 'asc')->first();
            if ($firstIncident) {
                $start = Carbon::parse($firstIncident->created_at);
                $end = $toDate ? Carbon::parse($toDate) : Carbon::now();
                return max(1, $start->diffInDays($end) + 1);
            }
        }
        return 1;
    }
}
