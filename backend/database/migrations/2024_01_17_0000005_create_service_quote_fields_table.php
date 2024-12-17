<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('service_quote_fields', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('service_id');
            $table->string('name');
            $table->string('label');
            $table->enum('type', [
                'text', 'textarea', 'number', 'select', 
                'multi-select', 'radio', 'checkbox', 
                'date', 'email', 'phone'
            ]);
            $table->boolean('required')->default(false);
            $table->integer('order')->default(0);
            $table->json('validation_rules')->nullable();
            $table->json('options')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('service_id')
                  ->references('id')
                  ->on('services')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('service_quote_fields');
    }
};
