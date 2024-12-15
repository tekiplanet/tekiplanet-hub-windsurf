<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\CourseNotice;
use App\Models\UserCourseNotice;
use Faker\Factory as Faker;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserCourseNoticesSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        
        // Ensure course notices exist
        if (CourseNotice::count() === 0) {
            $this->call(CourseNoticesSeeder::class);
        }
        
        // Ensure users exist
        if (User::count() === 0) {
            $this->call(UserSeeder::class);
        }

        $users = User::all();
        $courseNotices = CourseNotice::all();

        if ($users->isEmpty() || $courseNotices->isEmpty()) {
            $this->command->warn('No users or course notices found to seed user course notices.');
            return;
        }

        foreach ($users as $user) {
            // Randomly select 1-3 course notices for the user
            $selectedNotices = $courseNotices->random(min($courseNotices->count(), $faker->numberBetween(1, 3)));

            foreach ($selectedNotices as $courseNotice) {
                UserCourseNotice::create([
                    'user_id' => $user->id,
                    'course_notice_id' => $courseNotice->id,
                    'is_read' => $faker->boolean(40),
                    'read_at' => $faker->boolean(40) ? Carbon::now()->subDays($faker->numberBetween(0, 30)) : null
                ]);
            }
        }
    }
}
