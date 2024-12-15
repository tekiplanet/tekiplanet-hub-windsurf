<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        Schema::create('course_features', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('course_id');
            $table->string('feature');
            $table->timestamps();
        });

        // Manually add foreign key constraint
        DB::statement('
            ALTER TABLE course_features 
            ADD CONSTRAINT course_features_course_id_foreign 
            FOREIGN KEY (course_id) REFERENCES courses(id) 
            ON DELETE CASCADE
        ');

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    public function down()
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Drop foreign key first
        DB::statement('
            ALTER TABLE course_features 
            DROP FOREIGN KEY course_features_course_id_foreign
        ');

        Schema::dropIfExists('course_features');

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
