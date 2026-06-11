<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reason;
use Illuminate\Support\Facades\Validator;
use App\Services\ReasonService;

class ReasonController extends Controller
{
    protected $reasonService;

    public function __construct(ReasonService $reasonService)
    {
        $this->reasonService = $reasonService;
    }

    /**
     * List all reasons.
     */
    public function index(Request $request)
    {
        return response()->json($this->reasonService->getAll($request->channel_id), 200);
    }

    /**
     * Create a new reason.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // SAFETY CHECK: Only admin or superAdmin can create reasons
        if (!$user || !in_array($user->role, ['admin', 'superAdmin'])) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required permissions to create reasons.',
                'user_role' => $user ? $user->role : 'guest'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:reasons',
            'channel_id' => 'required|exists:channels,id',
            'responsible_dept' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $reason = $this->reasonService->create($validator->validated());

        return response()->json([
            'message' => 'Reason created successfully',
            'reason' => $reason->load('channel')
        ], 201);
    }

    /**
     * Display the specified reason.
     */
    public function show(Request $request, $id)
    {
        try {
            $reason = $this->reasonService->findById($id);
            return response()->json($reason, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Reason not found'], 404);
        }
    }

    /**
     * Update the specified reason.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        // SAFETY CHECK: Only admin or superAdmin can update reasons
        if (!$user || !in_array($user->role, ['admin', 'superAdmin'])) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required permissions to update reasons.',
                'user_role' => $user ? $user->role : 'guest'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:reasons,name,' . $id,
            'channel_id' => 'sometimes|exists:channels,id',
            'responsible_dept' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reason = $this->reasonService->update($id, $validator->validated());

            return response()->json([
                'message' => 'Reason updated successfully',
                'reason' => $reason->load('channel')
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Reason not found'], 404);
        }
    }

    /**
     * Remove the specified reason.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        // SAFETY CHECK: Only admin or superAdmin can delete reasons
        if (!$user || !in_array($user->role, ['admin', 'superAdmin'])) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required permissions to delete reasons.',
                'user_role' => $user ? $user->role : 'guest'
            ], 403);
        }

        try {
            $this->reasonService->delete($id);
            return response()->json([
                'message' => 'Reason deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Reason not found'], 404);
        }
    }
}
