<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\ReasonController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\AtmController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChannelController;
use App\Http\Controllers\DepartmentController;

// Public Routes
Route::post('/login/super-admin', [LoginController::class, 'superAdminLogin']);
Route::post('/login/admin', [LoginController::class, 'adminLogin']);
Route::post('/login/user', [LoginController::class, 'userLogin']);
Route::post('/super-admin/create', [SuperAdminController::class, 'storeSuperAdmin']);

// Protected Routes (Require Sanctum Token)
Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Super Admin Features
    Route::get('/super-admin/admins', [SuperAdminController::class, 'getAdmins']);
    Route::post('/admin/create', [AdminController::class, 'createAdmin']);
    Route::post('/super-admin/admins', [SuperAdminController::class, 'createAdmin']);
    Route::match(['get', 'patch'], '/super-admin/toggle-admin/{id}', [SuperAdminController::class, 'toggleAdminStatus']);
    Route::get('/super-admin/logs', [SuperAdminController::class, 'getActivityLogs']);

    // Admin Features
    Route::get('/admin/dashboard', [AdminController::class, 'dashboardSummary']);
    Route::get('/admin/users', [AdminController::class, 'listUsers']);
    Route::post('/admin/users', [AdminController::class, 'createUser']);
    Route::post('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::get('/admin/settings', [AdminController::class, 'getSettings']);
    Route::post('/admin/settings', [AdminController::class, 'updateSettings']);
    Route::put('/admin/incidents/{id}', [AdminController::class, 'updateIncident']);

    // Reasons Features
    Route::get('/reasons', [ReasonController::class, 'index']);
    Route::post('/reasons', [ReasonController::class, 'store']);
    Route::get('/reasons/{id}', [ReasonController::class, 'show']);
    Route::put('/reasons/{id}', [ReasonController::class, 'update']);
    Route::delete('/reasons/{id}', [ReasonController::class, 'destroy']);
    
    // Channel Features
    Route::get('/channels', [ChannelController::class, 'index']);
    Route::post('/channels', [ChannelController::class, 'store']);
    Route::get('/channels/{id}', [ChannelController::class, 'show']);
    Route::put('/channels/{id}', [ChannelController::class, 'update']);
    Route::delete('/channels/{id}', [ChannelController::class, 'destroy']);
    
    // Department Features
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::post('/departments', [DepartmentController::class, 'store']);
    Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    Route::put('/departments/{id}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

    // Inventory Incidents Features
    Route::get('/inventory/incidents', [InventoryController::class, 'fetchIncidents']);
    Route::post('/inventory/incidents', [InventoryController::class, 'store']);
    Route::post('/inventory/incidents/atm', [InventoryController::class, 'storeAtmIncident']);
    Route::get('/inventory/incidents/{id}', [InventoryController::class, 'show']);
    Route::put('/inventory/incidents/{id}', [InventoryController::class, 'update']);
    Route::delete('/inventory/incidents/{id}', [InventoryController::class, 'destroy']);
    
    // Branch Features
    Route::get('/branches', [BranchController::class, 'index']);
    Route::post('/branches', [BranchController::class, 'store']);
    Route::get('/branches/{id}', [BranchController::class, 'show']);
    Route::put('/branches/{id}', [BranchController::class, 'update']);
    Route::delete('/branches/{id}', [BranchController::class, 'destroy']);

    // ATM Features
    Route::get('/atms', [AtmController::class, 'index']);
    Route::post('/atms', [AtmController::class, 'store']);
    Route::get('/atms/{id}', [AtmController::class, 'show']);
    Route::put('/atms/{id}', [AtmController::class, 'update']);
    Route::delete('/atms/{id}', [AtmController::class, 'destroy']);

    // User Settings
    Route::post('/settings/change-password', [UserController::class, 'changePassword']);
});
