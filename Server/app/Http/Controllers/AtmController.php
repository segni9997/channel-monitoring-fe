<?php

namespace App\Http\Controllers;

use App\Models\Atm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\AtmService;

class AtmController extends Controller
{
    protected $atmService;

    public function __construct(AtmService $atmService)
    {
        $this->atmService = $atmService;
    }

    /**
     * Display a listing of the ATMs.
     */
    public function index(Request $request)
    {
        // Only admin or superAdmin can list ATMs
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($this->atmService->getAll($request->branch_id), 200);
    }

    /**
     * Store a newly created ATM(s) in storage.
     */
    public function store(Request $request)
    {
        // Only admin or superAdmin can create ATMs
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->all();

        // Wrap single object in an array for consistent processing
        $isSingle = !isset($data[0]);
        $input = $isSingle ? [$data] : $data;

        $validated = Validator::make($input, [
            '*.name' => 'required|string|max:255',
            '*.branch_id' => 'required|exists:branches,id',
        ])->validate();

        $created = $this->atmService->createMany($validated);

        return response()->json([
            'message' => count($created) . ' ATM(s) created successfully',
            'atms' => $isSingle ? $created[0] : $created
        ], 201);
    }

    /**
     * Display the specified ATM.
     */
    public function show(Request $request, $id)
    {
        // Only admin or superAdmin can view an ATM
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            $atm = $this->atmService->findById($id);
            return response()->json(['atm' => $atm], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'ATM not found'], 404);
        }
    }

    /**
     * Update the specified ATM in storage.
     */
    public function update(Request $request, $id)
    {
        // Only admin or superAdmin can update ATMs
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'branch_id' => 'sometimes|exists:branches,id',
        ]);

        try {
            $atm = $this->atmService->update($id, $validated);

            return response()->json([
                'message' => 'ATM updated successfully',
                'atm' => $atm
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'ATM not found'], 404);
        }
    }

    /**
     * Remove the specified ATM from storage.
     */
    public function destroy(Request $request, $id)
    {
        // Only admin or superAdmin can delete ATMs
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            $this->atmService->delete($id);
            return response()->json(['message' => 'ATM deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'ATM not found'], 404);
        }
    }
}
