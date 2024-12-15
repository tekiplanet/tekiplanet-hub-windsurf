<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Transaction Statement</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f6f9;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        .email-header {
            background-color: #007bff;
            color: white;
            text-align: center;
            padding: 20px;
        }
        .email-body {
            padding: 30px;
        }
        .email-footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 15px;
            color: #6c757d;
            font-size: 12px;
        }
        .cta-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Transaction Statement</h1>
        </div>
        
        <div class="email-body">
            <p>Hello {{ $userName }},</p>
            
            <p>Your transaction statement for the period 
                {{ \Carbon\Carbon::parse($startDate)->format('F j, Y') }} 
                to 
                {{ \Carbon\Carbon::parse($endDate)->format('F j, Y') }} 
                is now available. We have attached the detailed PDF statement to this email for your records.</p>
            
            <p>Key details:</p>
            <ul>
                <li>Statement Period: 
                    {{ \Carbon\Carbon::parse($startDate)->format('F j, Y') }} 
                    to 
                    {{ \Carbon\Carbon::parse($endDate)->format('F j, Y') }}
                </li>
                <li>Attached: Comprehensive Transaction Statement</li>
            </ul>
            
            <p>Please review the attached PDF for a complete breakdown of your transactions.</p>
            
            <a href="{{ config('app.url') }}/wallet" class="cta-button">View Wallet</a>
        </div>
        
        <div class="email-footer">
            <p>&copy; {{ date('Y') }} TekiPlanet Financial Services. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
