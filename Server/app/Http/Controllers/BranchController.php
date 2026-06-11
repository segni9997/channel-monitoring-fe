<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\BranchService;

class BranchController extends Controller
{
    protected $branchService;

    public function __construct(BranchService $branchService)
    {
        $this->branchService = $branchService;
    }

    /**
     * Display a listing of the branches.
     */
    public function index(Request $request)
    {
        // Only admin or superAdmin can list branches
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($this->branchService->getAll(), 200);
    }

    /**
     * Store a newly created branch(es) in storage.
     */
    public function store(Request $request)
    {
        // Only admin or superAdmin can create branches
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->all();

        // Wrap single object in an array for consistent processing
        $isSingle = !isset($data[0]);
        $input = $isSingle ? [$data] : $data;

        $validated = Validator::make($input, [
            '*.name' => 'required|string|max:255|unique:branches,name',
        ])->validate();

        $created = $this->branchService->createMany($validated);

        return response()->json([
            'message' => count($created) . ' branch(es) created successfully',
            'branches' => $isSingle ? $created[0] : $created
        ], 201);
    }

    /**
     * Display the specified branch.
     */
    public function show(Request $request, $id)
    {
        // Only admin or superAdmin can view a branch
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            $branch = $this->branchService->findById($id);
            return response()->json(['branch' => $branch], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Branch not found'], 404);
        }
    }

    /**
     * Update the specified branch in storage.
     */
    public function update(Request $request, $id)
    {
        // Only admin or superAdmin can update branches
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:branches,name,' . $id,
        ]);

        try {
            $branch = $this->branchService->update($id, $validated);

            return response()->json([
                'message' => 'Branch updated successfully',
                'branch' => $branch
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Branch not found'], 404);
        }
    }

    /**
     * Remove the specified branch from storage.
     */
    public function destroy(Request $request, $id)
    {
        // Only admin or superAdmin can delete branches
        if (!in_array($request->user()->role, ['admin', 'superAdmin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            $this->branchService->delete($id);
            return response()->json(['message' => 'Branch deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Branch not found'], 404);
        }
    }
}
