<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Incident;
use App\Models\SystemSetting;
use Carbon\Carbon;
use App\Services\IncidentService;
use App\Services\UserService;
use App\Services\SettingsService;

class AdminController extends Controller
{
    protected $incidentService;
    protected $userService;
    protected $settingsService;

    public function __construct(
        IncidentService $incidentService, 
        UserService $userService, 
        SettingsService $settingsService
    ) {
        $this->incidentService = $incidentService;
        $this->userService = $userService;
        $this->settingsService = $settingsService;
    }

    public function dashboardSummary(Request $request)
    {
        // SAFETY CHECK: Only admin or superAdmin can see the dashboard summary
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $summary = $this->incidentService->getDashboardSummary(
            $request->query('from'), 
            $request->query('to')
        );

        return response()->json($summary, 200);
    }

    /**
     * Get system settings.
     */
    public function getSettings(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($this->settingsService->getAllSettings(), 200);
    }

    /**
     * Update system settings.
     */
    public function updateSettings(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'shift_time' => 'sometimes|in:8,16,24',
        ]);

        $this->settingsService->updateSettings($validated);

        return response()->json(['message' => 'Settings updated successfully'], 200);
    }

    /**
     * Admin route to edit an incident.
     */
    public function updateIncident(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'downTimeStart' => 'sometimes|date',
            'downTimeEnd' => 'sometimes|date|after_or_equal:downTimeStart',
            'remark' => 'nullable|string',
            'status' => 'sometimes|in:completed,inprogress',
            'channel' => 'sometimes|in:USSD,APP,ATM,IPS,TOPUP,IBANK,LOROIB',
            'reasonId' => 'sometimes|exists:reasons,id',
            'branch_id' => 'nullable|exists:branches,id',
            'atm_id' => 'nullable|exists:atms,id',
        ]);

        try {
            $incident = $this->incidentService->updateIncident($id, $validated, true);

            return response()->json([
                'message' => 'Incident updated successfully',
                'incident' => $incident->load(['reason', 'branch', 'atm'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }

    public function createUser(Request $request)
    {
        // SAFETY CHECK: Only admin or superAdmin can create users
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'phoneNumber' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|in:officer,pms', // Strictly no 'admin' allowed
            'password' => 'required|string|min:8',
        ]);

        $user = $this->userService->createUser($validated);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    public function createAdmin(Request $request)
    {
        // SAFETY CHECK: Only superAdmin can create other admins
        if ($request->user()->role !== 'superAdmin') {
            return response()->json(['message' => 'Unauthorized. Only super admins can perform this action.'], 403);
        }

        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'phoneNumber' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = $this->userService->createAdmin($validated);

        return response()->json([
            'message' => 'Admin account created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * List all users.
     */
    public function listUsers(Request $request)
    {
        // SAFETY CHECK: Only admin or superAdmin can list users
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($this->userService->getAllUsers(), 200);
    }

    /**
     * Update an existing user.
     */
    public function updateUser(Request $request, $id)
    {
        // SAFETY CHECK: Only admin or superAdmin can update users
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'firstName' => 'sometimes|string|max:255',
            'lastName' => 'sometimes|string|max:255',
            'phoneNumber' => 'sometimes|string|max:20',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'role' => 'sometimes|in:admin,officer,pms',
            'password' => 'sometimes|string|min:8',
        ])->validate();

        $user = $this->userService->updateUser($id, $validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ], 200);
    }
}
