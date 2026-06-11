<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Incident;
use Carbon\Carbon;
use App\Services\IncidentService;

class InventoryController extends Controller
{
    protected $incidentService;

    public function __construct(IncidentService $incidentService)
    {
        $this->incidentService = $incidentService;
    }

    public function fetchIncidents(Request $request)
    {
        $filters = $request->only(['from_date', 'to_date', 'status', 'reason_id', 'channel', 'branch_id', 'atm_id']);
        $incidents = $this->incidentService->getFilteredIncidents($filters);

        return response()->json([
            'count' => $incidents->count(),
            'incidents' => $incidents
        ], 200);
    }

    // Create a new incident specifically for ATMs/Branches
    public function storeAtmIncident(Request $request)
    {
        $validated = $request->validate([
            'createdBy' => 'required|exists:users,id',
            'downTimeStart' => 'required|date',
            'downTimeEnd' => 'nullable|required_if:status,completed|date|after_or_equal:downTimeStart',
            'remark' => 'nullable|string',
            'status' => 'required|in:completed,inprogress',
            'channel' => 'required|in:USSD,APP,ATM,IPS,TOPUP,IBANK,LOROIB',
            'reasonId' => 'required|exists:reasons,id',
            'branch_id' => 'nullable|exists:branches,id',
            'atm_id' => 'nullable|exists:atms,id',
        ]);

        try {
            $incident = $this->incidentService->storeIncident($validated, true);

            return response()->json([
                'message' => 'ATM Incident created successfully',
                'incident' => $incident
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }

    // Create a new incident
    public function store(Request $request)
    {
        $validated = $request->validate([
            'createdBy' => 'required|exists:users,id',
            'downTimeStart' => 'required|date',
            'downTimeEnd' => 'nullable|required_if:status,completed|date|after_or_equal:downTimeStart',
            'remark' => 'nullable|string',
            'status' => 'required|in:completed,inprogress',
            'channel' => 'required|in:USSD,APP,ATM,IPS,TOPUP,IBANK,LOROIB',
            'reasonId' => 'required|exists:reasons,id',
        ]);

        try {
            $incident = $this->incidentService->storeIncident($validated, false);

            return response()->json([
                'message' => 'Incident created successfully',
                'incident' => $incident
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }

    // Get a single incident by ID
    public function show($id)
    {
        $incident = Incident::with(['reason', 'creator', 'users'])->find($id);

        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        return response()->json([
            'incident' => $incident
        ], 200);
    }

    // Update an existing incident
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'createdBy' => 'sometimes|exists:users,id',
            'downTimeStart' => 'sometimes|date',
            'downTimeEnd' => 'sometimes|date|after_or_equal:downTimeStart',
            'remark' => 'nullable|string',
            'status' => 'sometimes|in:completed,inprogress',
            'channel' => 'sometimes|in:USSD,APP,ATM,IPS,TOPUP,IBANK,LOROIB',
            'reasonId' => 'sometimes|exists:reasons,id',
        ]);

        try {
            $incident = $this->incidentService->updateIncident($id, $validated);

            return response()->json([
                'message' => 'Incident updated successfully',
                'incident' => $incident
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }

    // Delete an incident
    public function destroy($id)
    {
        try {
            $this->incidentService->deleteIncident($id);
            return response()->json(['message' => 'Incident deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Incident not found'], 404);
        }
    }
}
