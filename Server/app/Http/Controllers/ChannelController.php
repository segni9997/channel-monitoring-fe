<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\ChannelService;

class ChannelController extends Controller
{
    protected $channelService;

    public function __construct(ChannelService $channelService)
    {
        $this->channelService = $channelService;
    }

    /**
     * Display a listing of the channels.
     */
    public function index(Request $request)
    {
        return response()->json($this->channelService->getAll(), 200);
    }

    /**
     * Store a newly created channel in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // SAFETY CHECK: Only admin or superAdmin can create channels
        if (!$user || !in_array($user->role, ['admin', 'superAdmin'])) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required permissions to create channels.',
                'user_role' => $user ? $user->role : 'guest'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:channels',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $channel = $this->channelService->create($validator->validated());

        return response()->json([
            'message' => 'Channel created successfully',
            'channel' => $channel
        ], 201);
    }

    /**
     * Display the specified channel.
     */
    public function show(Request $request, $id)
    {
        try {
            $channel = $this->channelService->findById($id);
            return response()->json($channel, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Channel not found'], 404);
        }
    }

    /**
     * Update the specified channel in storage.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        // SAFETY CHECK: Only admin or superAdmin can update channels
        if (!$user || !in_array($user->role, ['admin', 'superAdmin'])) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required permissions to update channels.',
                'user_role' => $user ? $user->role : 'guest'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:channels,name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $channel = $this->channelService->update($id, $validator->validated());

            return response()->json([
                'message' => 'Channel updated successfully',
                'channel' => $channel
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Channel not found'], 404);
        }
    }

    /**
     * Remove the specified channel from storage.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        // SAFETY CHECK: Only admin or superAdmin can delete channels
        if (!$user || !in_array($user->role, ['admin', 'superAdmin'])) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required permissions to delete channels.',
                'user_role' => $user ? $user->role : 'guest'
            ], 403);
        }

        try {
            $this->channelService->delete($id);
            return response()->json(['message' => 'Channel deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Channel not found'], 404);
        }
    }
}
