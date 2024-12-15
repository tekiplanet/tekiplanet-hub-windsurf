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
            $table->text('description')->nullable();
            $table->integer('total_questions');
            $table->integer('pass_percentage');
            $table->integer('duration_minutes');
            $table->enum('type', ['multiple_choice', 'true_false', 'mixed']);
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced']);
            $table->boolean('is_mandatory')->default(false);
            
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
