<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('instructors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();
            $table->string('expertise')->nullable();
            $table->integer('total_courses')->default(0);
            $table->integer('total_students')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('instructors');
    }
};
