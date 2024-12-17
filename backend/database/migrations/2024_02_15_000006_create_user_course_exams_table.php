<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_course_exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('course_exam_id');
            
            // Exam attempt details
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'missed'])->default('not_started');
            $table->decimal('score', 5, 2)->nullable();
            $table->decimal('total_score', 5, 2)->nullable();
            
            // Attempt tracking
            $table->integer('attempts')->default(0);
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            
            // Additional metadata
            $table->json('answers')->nullable();
            $table->json('review_notes')->nullable();
            
            // Unique constraint to prevent duplicate exam attempts
            $table->unique(['user_id', 'course_exam_id']);
            
            // Foreign key constraints
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
            
            $table->foreign('course_exam_id')
                  ->references('id')
                  ->on('course_exams')
                  ->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_course_exams');
    }
};
