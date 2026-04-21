<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class LoginController extends Controller
{
    public function adminLogin(Request $request)
    {
        // Validate input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }

        // Enforce admin-only login
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Only admins can access this route.'
            ], 403);
        }

        // Generate Sanctum token
        $token = $user->createToken('admin_auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Admin logged in successfully',
            'user' => $user,
            'token' => $token
        ], 200);
    }

    public function userLogin(Request $request)
    {
        // Validate input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }

        // Enforce non-admin login (officer or pms)
        if (!in_array($user->role, ['officer', 'pms'])) {
            return response()->json([
                'message' => 'Unauthorized. This login is only for officers and PMS.'
            ], 403);
        }

        // Generate Sanctum token
        $token = $user->createToken('user_auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User logged in successfully',
            'user' => $user,
            'token' => $token
        ], 200);
    }
}
