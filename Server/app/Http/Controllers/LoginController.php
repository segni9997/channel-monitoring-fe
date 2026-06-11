<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Services\AuthService;

class LoginController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function adminLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            $result = $this->authService->login(
                $request->email, 
                $request->password, 
                ['admin'], 
                'admin_auth_token'
            );

            return response()->json([
                'message' => 'Admin logged in successfully',
                'user' => $result['user'],
                'token' => $result['token']
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 401);
        }
    }

    public function userLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            $result = $this->authService->login(
                $request->email, 
                $request->password, 
                ['officer', 'pms'], 
                'user_auth_token'
            );

            return response()->json([
                'message' => 'User logged in successfully',
                'user' => $result['user'],
                'token' => $result['token']
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 401);
        }
    }

    public function superAdminLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            $result = $this->authService->login(
                $request->email, 
                $request->password, 
                ['superAdmin'], 
                'super_admin_auth_token'
            );

            return response()->json([
                'message' => 'Super Admin logged in successfully',
                'user' => $result['user'],
                'token' => $result['token']
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 401);
        }
    }
}
