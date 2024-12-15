<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('course_lessons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('module_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('content_type', ['video', 'text', 'quiz', 'assignment']);
            $table->integer('duration_minutes')->nullable();
            $table->integer('order')->default(0);
            $table->string('resource_url')->nullable();
            $table->boolean('is_preview')->default(false);
            
            $table->foreign('module_id')
                  ->references('id')
                  ->on('course_modules')
                  ->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('course_lessons');
    }
};
