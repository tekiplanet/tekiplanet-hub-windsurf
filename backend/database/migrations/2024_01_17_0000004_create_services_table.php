<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('category_id');
            $table->string('name')->unique();
            $table->text('short_description')->nullable();
            $table->text('long_description')->nullable();
            $table->decimal('starting_price', 10, 2)->nullable();
            $table->string('icon_name')->nullable(); // Changed from icon_path to icon_name
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('category_id')
                  ->references('id')
                  ->on('service_categories')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('services');
    }
};
