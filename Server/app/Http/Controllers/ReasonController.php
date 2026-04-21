<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reason;

class ReasonController extends Controller
{
    /**
     * List all reasons.
     */
    public function index()
    {
        $reasons = Reason::all();
        return response()->json($reasons, 200);
    }

    /**
     * Create a new reason.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:reasons',
        ]);

        $reason = Reason::create($validated);

        return response()->json([
            'message' => 'Reason created successfully',
            'reason' => $reason
        ], 201);
    }

    /**
     * Display the specified reason.
     */
    public function show($id)
    {
        $reason = Reason::find($id);

        if (!$reason) {
            return response()->json(['message' => 'Reason not found'], 404);
        }

        return response()->json($reason, 200);
    }

    /**
     * Update the specified reason.
     */
    public function update(Request $request, $id)
    {
        $reason = Reason::find($id);

        if (!$reason) {
            return response()->json(['message' => 'Reason not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:reasons,name,' . $id,
        ]);

        $reason->update($validated);

        return response()->json([
            'message' => 'Reason updated successfully',
            'reason' => $reason
        ], 200);
    }

    /**
     * Remove the specified reason.
     */
    public function destroy($id)
    {
        $reason = Reason::find($id);

        if (!$reason) {
            return response()->json(['message' => 'Reason not found'], 404);
        }

        $reason->delete();

        return response()->json([
            'message' => 'Reason deleted successfully'
        ], 200);
    }
}
