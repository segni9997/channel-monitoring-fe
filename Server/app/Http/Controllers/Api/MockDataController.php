<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Seeders\MockDataSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class MockDataController extends Controller
{
    /**
     * Trigger the mock data seeding.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function seed(Request $request)
    {
        try {
            // Run the seeder
            Artisan::call('db:seed', [
                '--class' => 'Database\\Seeders\\MockDataSeeder'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Mock data seeded successfully.',
                'output' => Artisan::output()
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Seeding failed: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to seed mock data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
