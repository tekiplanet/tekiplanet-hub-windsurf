<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CreateFontsDirectory extends Command
{
    protected $signature = 'fonts:create';
    protected $description = 'Create fonts directory in public folder';

    public function handle()
    {
        $fontsPath = public_path('fonts');
        
        if (!File::exists($fontsPath)) {
            File::makeDirectory($fontsPath, 0755, true);
            $this->info('Fonts directory created successfully.');
        } else {
            $this->info('Fonts directory already exists.');
        }
    }
}
