<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\UserPreferencesController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::get('/transactions/filter', [TransactionController::class, 'filter']);
        Route::post('/transactions/export-statement', [TransactionController::class, 'exportStatement']);
        Route::get('/transactions/{transactionId}', [TransactionController::class, 'getTransactionDetails']);
        Route::get('/transactions/{transactionId}/receipt', [TransactionController::class, 'generateReceipt'])
            ->middleware('auth:sanctum');
        
        // Wallet Funding Routes
        Route::post('/wallet/bank-transfer', [WalletController::class, 'bankTransferPayment']);
        Route::post('/wallet/initiate-paystack-payment', [WalletController::class, 'initiatePaystackPayment']);
        Route::post('/wallet/verify-paystack-payment', [WalletController::class, 'verifyPaystackPayment']);
    });
});

// User Preferences Route
Route::middleware(['auth:sanctum'])->group(function () {
    Route::put('/user/preferences', [UserController::class, 'updatePreferences']);
    Route::put('/user/type', [UserController::class, 'updateUserType']);
});
