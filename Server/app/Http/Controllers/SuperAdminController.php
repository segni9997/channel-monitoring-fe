<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\SystemLog;
use App\Services\UserService;
use App\Services\SuperAdminService;

class SuperAdminController extends Controller
{
    protected $superAdminService;
    protected $userService;

    public function __construct(SuperAdminService $superAdminService, UserService $userService)
    {
        $this->superAdminService = $superAdminService;
        $this->userService = $userService;
    }

    // Create a new normal admin
    public function createAdmin(Request $request)
    {
        // SAFETY CHECK: Ensure the authenticated user is a superAdmin
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

        $admin = User::create([
            'firstName' => $validated['firstName'],
            'lastName' => $validated['lastName'],
            'phoneNumber' => $validated['phoneNumber'],
            'email' => $validated['email'],
            'role' => 'admin',
            'is_active' => true,
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Admin created successfully',
            'admin' => $admin
        ], 201);
    }

    // Create a new superAdmin
    public function storeSuperAdmin(Request $request)
    {
        // This is a setup route, but we should still protect it if a superAdmin exists, 
        // or just allow it for initial setup. For safety, let's allow it for now 
        // as you requested a route to create one.
        
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'phoneNumber' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $superAdmin = User::create([
            'firstName' => $validated['firstName'],
            'lastName' => $validated['lastName'],
            'phoneNumber' => $validated['phoneNumber'],
            'email' => $validated['email'],
            'role' => 'superAdmin',
            'is_active' => true,
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Super Admin created successfully',
            'superAdmin' => $superAdmin
        ], 201);
    }

    public function getAdmins(Request $request)
    {
        // SAFETY CHECK: Only superAdmin can access this route
        if ($request->user()->role !== 'superAdmin') {
            return response()->json(['message' => 'Unauthorized. Only super admins can access this route.'], 403);
        }

        $admins = User::where('role', 'admin')->get();
        return response()->json($admins, 200);
    }

    // Toggle admin active status
    public function toggleAdminStatus(Request $request, $id)
    {
        // SAFETY CHECK: Only superAdmin can access this route
        if ($request->user()->role !== 'superAdmin') {
            return response()->json(['message' => 'Unauthorized. Only super admins can access this route.'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Toggle status
        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'activated' : 'disabled';

        return response()->json([
            'message' => "Admin account ID {$id} has been {$status}",
            'user' => $user
        ], 200);
    }

    public function createReason(Request $request)
    {
        // SAFETY CHECK: Only superAdmin can access this route
        if ($request->user()->role !== 'superAdmin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:reasons',
            'channel_id' => 'required|exists:channels,id',
            'responsible_dept' => 'required|string|max:255',
        ]);

        $reason = \App\Models\Reason::create($validated);

        return response()->json([
            'message' => 'Reason created successfully',
            'reason' => $reason
        ], 201);
    }

    /**
     * Get all system activity logs.
     */
    public function getActivityLogs(Request $request)
    {
        // SAFETY CHECK: Only superAdmin can view system logs
        if ($request->user()->role !== 'superAdmin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $filters = $request->only(['user_id', 'action']);
        $logs = $this->superAdminService->getActivityLogs($filters, $request->query('per_page', 50));

        return response()->json($logs, 200);
    }
}
