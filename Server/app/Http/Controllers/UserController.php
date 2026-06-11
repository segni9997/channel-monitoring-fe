<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Services\UserService;

class UserController extends Controller
{
    protected $userService;
    protected $settingsService;

    public function __construct(UserService $userService, \App\Services\SettingsService $settingsService)
    {
        $this->userService = $userService;
        $this->settingsService = $settingsService;
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ])->validate();

        try {
            $this->userService->changePassword(
                $request->user(), 
                $validated['old_password'], 
                $validated['new_password']
            );

            return response()->json([
                'message' => 'Password changed successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }

    /**
     * Register the shift start time for the authenticated user.
     */
    public function startShift(Request $request)
    {
        $request->validate([
            'shift_start_time' => 'nullable|date',
        ]);

        try {
            $startTime = $this->settingsService->startGlobalShift($request->shift_start_time);

            return response()->json([
                'message' => 'Global shift started successfully',
                'shift_start_time' => $startTime
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
    }
}
