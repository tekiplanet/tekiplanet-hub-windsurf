<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Transaction Receipt</title>
    <style>
        body { font-family: sans-serif; }
        .receipt { 
            width: 100%; 
            max-width: 600px; 
            margin: 0 auto; 
            border: 1px solid #000; 
            padding: 20px; 
        }
        .header { 
            text-align: center; 
            background-color: #3b82f6; 
            color: white; 
            padding: 10px; 
        }
        .detail { 
            margin: 10px 0; 
            display: flex; 
            justify-content: space-between; 
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>Transaction Receipt</h1>
        </div>
        
        <div class="detail">
            <strong>Transaction ID:</strong>
            <span>{{ $transaction->id }}</span>
        </div>
        
        <div class="detail">
            <strong>Amount:</strong>
            <span>{{ $transaction->type === 'credit' ? '+' : '-' }}${{ $transaction->amount }}</span>
        </div>
        
        <div class="detail">
            <strong>Date:</strong>
            <span>{{ $transaction->created_at->format('M d, Y H:i A') }}</span>
        </div>
        
        <div class="detail">
            <strong>Type:</strong>
            <span>{{ strtoupper($transaction->type) }}</span>
        </div>
        
        @if($transaction->payment_method)
        <div class="detail">
            <strong>Payment Method:</strong>
            <span>{{ $transaction->payment_method }}</span>
        </div>
        @endif
        
        <div class="detail">
            <strong>Wallet:</strong>
            <span>{{ $wallet->name ?? 'Default Wallet' }}</span>
        </div>
    </div>
</body>
</html>
