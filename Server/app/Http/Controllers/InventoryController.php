<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Incident;
use Carbon\Carbon;

class InventoryController extends Controller
{
    public function fetchIncidents(Request $request)
    {
        $query = Incident::query();

        // 1. Filter by Date Range (from & to)
        // We will use downTimeStart, but you could also use created_at if you prefer
        if ($request->filled('from_date') && $request->filled('to_date')) {
            $query->whereBetween('downTimeStart', [$request->from_date, $request->to_date]);
        } elseif ($request->filled('from_date')) {
            $query->where('downTimeStart', '>=', $request->from_date);
        } elseif ($request->filled('to_date')) {
            $query->where('downTimeStart', '<=', $request->to_date);
        }

        // 2. Filter by Status (e.g., 'completed', 'inprogress')
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 3. Filter by Reason (reasonId)
        if ($request->filled('reason_id')) {
            $query->where('reasonId', $request->reason_id);
        }

        // 4. Filter by Channel (e.g., 'USSD', 'APP', 'ATM', etc.)
        if ($request->filled('channel')) {
            $query->where('channel', $request->channel);
        }

        // Eager load relationships to make the response richer
        $incidents = $query->with(['reason', 'creator'])->get();

        return response()->json([
            'count' => $incidents->count(),
            'incidents' => $incidents
        ], 200);
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

        // Automatically calculate duration if completed
        if ($validated['status'] === 'completed' && !empty($validated['downTimeEnd'])) {
            $start = Carbon::parse($validated['downTimeStart']);
            $end = Carbon::parse($validated['downTimeEnd']);
            $validated['duration'] = $start->diffInMinutes($end) . ' mins';
        }

        $incident = Incident::create($validated);

        return response()->json([
            'message' => 'Incident created successfully',
            'incident' => $incident
        ], 201);
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
        $incident = Incident::find($id);

        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        // Check if the incident is already completed
        if ($incident->status === 'completed' && $request->status === 'completed') {
            return response()->json([
                'message' => 'This incident is already marked as completed.'
            ], 422);
        }

        $validated = $request->validate([
            'createdBy' => 'sometimes|exists:users,id',
            'downTimeStart' => 'sometimes|date',
            'downTimeEnd' => 'sometimes|date|after_or_equal:downTimeStart',
            'remark' => 'nullable|string',
            'status' => 'sometimes|in:completed,inprogress',
            'channel' => 'sometimes|in:USSD,APP,ATM,IPS,TOPUP,IBANK,LOROIB',
            'reasonId' => 'sometimes|exists:reasons,id',
        ]);

        // Automatically calculate duration if it is being completed
        $finalStatus = $validated['status'] ?? $incident->status;
        $finalStart = $validated['downTimeStart'] ?? $incident->downTimeStart;
        $finalEnd = $validated['downTimeEnd'] ?? $incident->downTimeEnd;

        if ($finalStatus === 'completed' && !empty($finalEnd)) {
            $start = Carbon::parse($finalStart);
            $end = Carbon::parse($finalEnd);
            $validated['duration'] = $start->diffInMinutes($end) . ' mins';
        }

        $incident->update($validated);

        return response()->json([
            'message' => 'Incident updated successfully',
            'incident' => $incident
        ], 200);
    }

    // Delete an incident
    public function destroy($id)
    {
        $incident = Incident::find($id);

        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        $incident->delete();

        return response()->json([
            'message' => 'Incident deleted successfully'
        ], 200);
    }
}
