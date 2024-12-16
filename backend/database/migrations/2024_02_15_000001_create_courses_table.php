<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category');
            $table->string('level');
            $table->decimal('price', 10, 2);
            $table->uuid('instructor_id')->nullable();
            $table->foreign('instructor_id')
                  ->references('id')
                  ->on('instructors')
                  ->onDelete('set null');
            $table->text('image_url')->nullable();
            $table->integer('duration_hours')->nullable();
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->float('rating')->default(0);
            $table->integer('total_reviews')->default(0);
            $table->integer('total_students')->default(0);
            $table->json('prerequisites')->nullable();
            $table->json('learning_outcomes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('courses');
    }
};
