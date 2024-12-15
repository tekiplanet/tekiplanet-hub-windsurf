<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('course_topics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('module_id');
            $table->foreign('module_id')
                  ->references('id')
                  ->on('course_modules')
                  ->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('learning_outcomes')->nullable();
            $table->integer('order_index')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('course_topics');
    }
};
