<?php

return [
    'show_warnings' => false,   // Disable warnings
    'orientation' => 'portrait',
    'defines' => [
        'font_dir' => storage_path('fonts/'), // Ensure font directory exists
        'font_cache' => storage_path('fonts/'),
    ],
    'default_font' => 'DejaVu Sans',
    'font_dir' => storage_path('fonts/'), // Duplicate to ensure
    'font_cache' => storage_path('fonts/'),
];
