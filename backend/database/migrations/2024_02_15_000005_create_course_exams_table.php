<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('course_exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('course_id');
            
            $table->string('title');
            $table->string('type');
            $table->timestamp('date');
            $table->string('duration');
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])
                  ->default('scheduled');
            
            $table->json('topics')->nullable();
            
            $table->foreign('course_id')
                  ->references('id')
                  ->on('courses')
                  ->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('course_exams');
    }
};
