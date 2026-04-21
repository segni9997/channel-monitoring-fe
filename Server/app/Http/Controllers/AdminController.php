<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Incident;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function dashboardSummary(Request $request)
    {
        $timeFilter = $request->query('filter'); // '24hrs', 'day', 'week', 'month', 'year'

        $query = Incident::query();

        if ($timeFilter) {
            $now = Carbon::now();
            switch ($timeFilter) {
                case '24hrs':
                case 'day': // Depending on what you mean by 'last day', this might be the same as 24hrs
                    $query->where('created_at', '>=', $now->copy()->subDay());
                    break;
                case 'week':
                    $query->where('created_at', '>=', $now->copy()->subWeek());
                    break;
                case 'month':
                    $query->where('created_at', '>=', $now->copy()->subMonth());
                    break;
                case 'year':
                    $query->where('created_at', '>=', $now->copy()->subYear());
                    break;
                default:
                    $query->where('created_at', '>=', $now->copy()->subDay());
                    break;
            }
        }

        $incidents = $query->get();

        $totalIncidents = $incidents->count();
        $pendingIncidents = $incidents->where('status', 'inprogress')->count();
        $completedIncidents = $incidents->where('status', 'completed')->count();

        // Calculate total downtime
        // Assuming duration is stored as a numeric string (e.g., minutes).
        // intval() will pull the number out even if there is text attached like "120 mins"
        $totalDownTime = $incidents->sum(function ($incident) {
            return (int) $incident->duration; 
        });

        return response()->json([
            'total_incidents' => $totalIncidents,
            'pending_incidents' => $pendingIncidents,
            'completed_incidents' => $completedIncidents,
            'total_down_time' => $totalDownTime,
            'filter_applied' => $timeFilter ?? 'all_time'
        ], 200);
    }

    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'phoneNumber' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|in:officer,pms', // Strictly no 'admin' allowed
            'password' => 'required|string|min:8',
        ]);

        $user = \App\Models\User::create([
            'firstName' => $validated['firstName'],
            'lastName' => $validated['lastName'],
            'phoneNumber' => $validated['phoneNumber'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    public function createAdmin(Request $request)
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'phoneNumber' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = \App\Models\User::create([
            'firstName' => $validated['firstName'],
            'lastName' => $validated['lastName'],
            'phoneNumber' => $validated['phoneNumber'],
            'email' => $validated['email'],
            'role' => 'admin',
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Admin account created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * List all users.
     */
    public function listUsers()
    {
        return response()->json(\App\Models\User::all(), 200);
    }

    /**
     * Update an existing user.
     */
    public function updateUser(Request $request, $id)
    {
        // return response()->json(['received_data' => $request->all(), 'content_type' => $request->header('Content-Type')]);

        $user = \App\Models\User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // return response()->json([
        //     'message' => 'Validation passed',
        //     'requesttt' => $request->all(),
        // ]);

        // // Map snake_case to camelCase automatically if provided
        // $data = $request->all();
        // if (isset($data['first_name'])) $data['firstName'] = $data['first_name'];
        // if (isset($data['last_name'])) $data['lastName'] = $data['last_name'];
        // if (isset($data['phone_number'])) $data['phoneNumber'] = $data['phone_number'];

        $validated = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'firstName' => 'sometimes|string|max:255',
            'lastName' => 'sometimes|string|max:255',
            'phoneNumber' => 'sometimes|string|max:20',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'sometimes|in:admin,officer,pms',
            'password' => 'sometimes|string|min:8',
        ])->validate();

        if (isset($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }
        

        $user->update($validated);
        $user->refresh();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ], 200);
    }
}
