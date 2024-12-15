<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('course_notices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('course_id');
            
            $table->string('title');
            $table->text('content');
            $table->enum('priority', ['low', 'medium', 'high'])->default('low');
            $table->boolean('is_important')->default(false);
            
            $table->foreign('course_id')
                  ->references('id')
                  ->on('courses')
                  ->onDelete('cascade');
            
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('course_notices');
    }
};
