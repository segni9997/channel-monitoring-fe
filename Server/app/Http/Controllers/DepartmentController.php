<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\DepartmentService;

class DepartmentController extends Controller
{
    protected $departmentService;

    public function __construct(DepartmentService $departmentService)
    {
        $this->departmentService = $departmentService;
    }

    /**
     * Display a listing of the departments.
     */
    public function index(Request $request)
    {
        return response()->json($this->departmentService->getAll(), 200);
    }

    /**
     * Store a newly created department(s) in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // SAFETY CHECK: Only admin or superAdmin can create departments
        if (!$user || !in_array($user->role, ['admin', 'superAdmin'])) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required permissions to create departments.',
                'user_role' => $user ? $user->role : 'guest'
            ], 403);
        }

        $data = $request->all();

        // Wrap single object in an array for consistent processing
        $isSingle = !isset($data[0]);
        $input = $isSingle ? [$data] : $data;

        $validator = Validator::make($input, [
            '*.name' => 'required|string|max:255|unique:departments,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $created = $this->departmentService->createMany($validator->validated());

        return response()->json([
            'message' => count($created) . ' department(s) created successfully',
            'departments' => $isSingle ? $created[0] : $created
        ], 201);
    }

    /**
     * Display the specified department.
     */
    public function show(Request $request, $id)
    {
        try {
            $department = $this->departmentService->findById($id);
            return response()->json($department, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Department not found'], 404);
        }
    }

    /**
     * Update the specified department in storage.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        // SAFETY CHECK: Only admin or superAdmin can update departments
        if (!$user || !in_array($user->role, ['admin', 'superAdmin'])) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required permissions to update departments.',
                'user_role' => $user ? $user->role : 'guest'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:departments,name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $department = $this->departmentService->update($id, $validator->validated());

            return response()->json([
                'message' => 'Department updated successfully',
                'department' => $department
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Department not found'], 404);
        }
    }

    /**
     * Remove the specified department from storage.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        // SAFETY CHECK: Only admin or superAdmin can delete departments
        if (!$user || !in_array($user->role, ['admin', 'superAdmin'])) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required permissions to delete departments.',
                'user_role' => $user ? $user->role : 'guest'
            ], 403);
        }

        try {
            $this->departmentService->delete($id);
            return response()->json(['message' => 'Department deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Department not found'], 404);
        }
    }
}
