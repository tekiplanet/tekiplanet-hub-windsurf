<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQuotesTable extends Migration
{
    public function up()
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('service_id');
            $table->uuid('user_id');
            $table->string('industry');
            $table->string('budget_range');
            $table->string('contact_method');
            $table->text('project_description');
            $table->date('project_deadline');
            $table->json('quote_fields')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'accepted', 'rejected'])->default('pending');
            $table->uuid('assigned_to')->nullable();
            $table->string('priority')->nullable();
            $table->string('submitted_ip')->nullable();
            $table->decimal('estimated_value', 15, 2)->nullable();
            $table->string('source')->nullable();
            $table->string('referral_code')->nullable();

            $table->foreign('service_id')
                ->references('id')
                ->on('services')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('assigned_to')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('quotes');
    }
}
