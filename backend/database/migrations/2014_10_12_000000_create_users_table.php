<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->text('bio')->nullable();
            $table->string('timezone')->nullable();
            $table->string('avatar')->nullable();
            
            // Add account type column
            $table->enum('account_type', ['student', 'business', 'professional'])->default('student');
            
            $table->decimal('wallet_balance', 10, 2)->default(0.00)->nullable();
            
            $table->boolean('dark_mode')->default(false);
            $table->boolean('two_factor_enabled')->default(false);
            $table->boolean('email_notifications')->default(true);
            $table->boolean('push_notifications')->default(true);
            $table->boolean('marketing_notifications')->default(true);
            $table->string('profile_visibility')->default('public');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
