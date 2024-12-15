<?php

namespace App\Http\Controllers;

use App\Mail\TransactionStatementMail;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use TCPDF;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        // Get the logged-in user
        $user = Auth::user();

        // Retrieve transactions for the logged-in user
        $transactions = Transaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20); // 20 transactions per page

        return response()->json([
            'transactions' => $transactions,
            'stats' => [
                'total_spent' => $transactions->where('type', 'debit')->sum('amount'),
                'total_funded' => $transactions->where('type', 'credit')->sum('amount'),
                'total_transactions' => $transactions->count()
            ]
        ]);
    }

    public function filter(Request $request)
    {
        $user = Auth::user();

        $query = Transaction::where('user_id', $user->id);

        // Optional filters
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->input('start_date'), 
                $request->input('end_date')
            ]);
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($transactions);
    }

    public function exportStatement(Request $request)
    {
        try {
            // More robust user authentication and retrieval
            $user = $request->user();
            
            // Ensure user is authenticated
            if (!$user) {
                Log::error('Transaction Statement Export Error: Unauthenticated user');
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Ensure user is a valid object with required properties
            if (!is_object($user) || !isset($user->id) || !isset($user->email)) {
                Log::error('Transaction Statement Export Error: Invalid user object', [
                    'user_type' => gettype($user),
                    'user_data' => json_encode($user)
                ]);
                return response()->json(['error' => 'Invalid user data'], 400);
            }

            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');

            // Validate date range
            if (!$startDate || !$endDate) {
                return response()->json(['error' => 'Start and end dates are required'], 400);
            }

            $startDateTime = Carbon::parse($startDate)->startOfDay();
            $endDateTime = Carbon::parse($endDate)->endOfDay();

            // Validate date range (at least one week)
            if ($startDateTime->diffInDays($endDateTime) < 7) {
                return response()->json(['error' => 'Date range must cover at least one week'], 400);
            }

            // Retrieve transactions
            $transactions = Transaction::where('user_id', $user->id)
                ->whereBetween('created_at', [$startDateTime, $endDateTime])
                ->orderBy('created_at', 'desc')
                ->get();

            // Check if there are no transactions
            if ($transactions->isEmpty()) {
                return response()->json([
                    'message' => 'No transactions found in the selected date range',
                    'details' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate
                    ]
                ], 404);
            }

            // Generate PDF Statement
            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
            $pdf->SetCreator(PDF_CREATOR);
            $pdf->SetAuthor('TekiPlanet');
            $pdf->SetTitle('Transaction Statement');
            $pdf->SetSubject('Transaction Statement');
            $pdf->SetKeywords('TekiPlanet, Transaction, Statement');

            // Set default header data
            $pdf->SetHeaderData(PDF_HEADER_LOGO, PDF_HEADER_LOGO_WIDTH, 'TekiPlanet Transaction Statement', 
                "From {$startDate} to {$endDate}", [0,64,255], [0,64,128]);
            $pdf->setHeaderFont([PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN]);
            $pdf->setFooterFont([PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA]);

            // Set default monospaced font
            $pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

            // Set margins
            $pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
            $pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
            $pdf->SetFooterMargin(PDF_MARGIN_FOOTER);

            // Set auto page breaks
            $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

            // Add a page
            $pdf->AddPage();

            // Title
            $pdf->SetFont('helvetica', 'B', 16);
            $pdf->Cell(0, 10, 'Transaction Statement', 0, 1, 'C');

            // User Details
            $pdf->SetFont('helvetica', '', 10);
            $pdf->Cell(0, 6, "Name: {$user->first_name} {$user->last_name}", 0, 1);
            $pdf->Cell(0, 6, "Email: {$user->email}", 0, 1);
            $pdf->Cell(0, 6, "Date Range: {$startDate} to {$endDate}", 0, 1);
            $pdf->Ln(10);

            // Transactions Table Header
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->Cell(40, 7, 'Date & Time', 1, 0, 'C');
            $pdf->Cell(30, 7, 'Transaction ID', 1, 0, 'C');
            $pdf->Cell(30, 7, 'Type', 1, 0, 'C');
            $pdf->Cell(40, 7, 'Amount (NGN)', 1, 0, 'C');
            $pdf->Cell(40, 7, 'Description', 1, 1, 'C');

            // Transactions Table Body
            $pdf->SetFont('helvetica', '', 9);
            foreach ($transactions as $transaction) {
                // Format date with time, truncate transaction ID if too long
                $formattedDate = $transaction->created_at->format('Y-m-d H:i:s');
                $truncatedTransactionId = strlen($transaction->id) > 10 
                    ? substr($transaction->id, 0, 7) . '...' 
                    : $transaction->id;

                $pdf->Cell(40, 6, $formattedDate, 1, 0, 'C');
                $pdf->Cell(30, 6, $truncatedTransactionId, 1, 0, 'C');
                $pdf->Cell(30, 6, ucfirst($transaction->type), 1, 0, 'C');
                $pdf->Cell(40, 6, number_format($transaction->amount, 2), 1, 0, 'R');
                $pdf->Cell(40, 6, $transaction->description ?? 'N/A', 1, 1, 'L');
            }

            // Totals
            $pdf->Ln(10);
            $pdf->SetFont('helvetica', 'B', 10);
            $totalCredit = $transactions->where('type', 'credit')->sum('amount');
            $totalDebit = $transactions->where('type', 'debit')->sum('amount');
            $pdf->Cell(0, 6, "Total Credit: NGN " . number_format($totalCredit, 2), 0, 1, 'R');
            $pdf->Cell(0, 6, "Total Debit: NGN " . number_format($totalDebit, 2), 0, 1, 'R');

            // Output PDF
            $pdfContent = $pdf->Output('transaction_statement.pdf', 'S');

            // Send email with transaction details
            Mail::to($user->email)->send(new TransactionStatementMail(
                $user, 
                $startDate, 
                $endDate,
                $transactions,
                $pdfContent  // Pass the PDF content
            ));

            return response()->json([
                'message' => 'Transaction statement exported successfully',
                'details' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'total_transactions' => $transactions->count()
                ]
            ], 200);
        } catch (\Exception $e) {
            // Log the full error for debugging
            Log::error('Transaction Statement Export Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'error' => 'An error occurred while exporting the transaction statement',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getTransactionDetails($transactionId)
    {
        try {
            $user = auth()->user();

            // Fetch the specific transaction with additional details
            $transaction = Transaction::where('user_id', $user->id)
                ->where('id', $transactionId)
                ->firstOrFail();

            // Fetch related information based on transaction type
            switch ($transaction->type) {
                case 'credit':
                    $relatedInfo = $this->getCreditTransactionDetails($transaction);
                    break;
                case 'debit':
                    $relatedInfo = $this->getDebitTransactionDetails($transaction);
                    break;
                default:
                    $relatedInfo = null;
            }

            // Prepare detailed response
            return response()->json([
                'transaction' => $transaction,
                'related_info' => $relatedInfo,
                'metadata' => [
                    'timestamp' => $transaction->created_at->toIso8601String(),
                    'formatted_date' => $transaction->created_at->format('F d, Y H:i A'),
                    'timezone' => config('app.timezone')
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Transaction Details Error: ' . $e->getMessage());

            return response()->json([
                'error' => 'Transaction not found or access denied',
                'details' => $e->getMessage()
            ], 404);
        }
    }

    private function getCreditTransactionDetails(Transaction $transaction)
    {
        // Example: For funding transactions, get payment method details
        switch ($transaction->description) {
            case 'Bank Transfer':
                return [
                    'payment_method' => 'Bank Transfer',
                    'bank_name' => 'Sample Bank',
                    'last_four_digits' => '1234'
                ];
            case 'Card Deposit':
                return [
                    'payment_method' => 'Credit Card',
                    'card_brand' => 'Visa',
                    'last_four_digits' => '5678'
                ];
            default:
                return null;
        }
    }

    private function getDebitTransactionDetails(Transaction $transaction)
    {
        // Example: For spending transactions, get merchant or service details
        switch ($transaction->description) {
            case 'Online Purchase':
                return [
                    'merchant' => 'TechStore',
                    'category' => 'Electronics',
                    'transaction_id' => 'TECH-' . uniqid()
                ];
            case 'Service Payment':
                return [
                    'service_provider' => 'Cloud Hosting',
                    'service_type' => 'Monthly Subscription',
                    'invoice_number' => 'INV-' . uniqid()
                ];
            default:
                return null;
        }
    }

    public function getTransactionReceipt($transactionId)
    {
        try {
            $user = auth()->user();
            $transaction = Transaction::where('user_id', $user->id)
                ->where('id', $transactionId)
                ->firstOrFail();

            // Generate receipt
            return $this->generateReceipt($transactionId);
        } catch (\Exception $e) {
            Log::error('Transaction Receipt Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Could not generate receipt',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function generateReceipt($transactionId)
    {
        try {
            // Verify transaction belongs to authenticated user
            $transaction = Transaction::where('user_id', Auth::id())
                ->where('id', $transactionId)
                ->firstOrFail();

            // Get user details
            $user = Auth::user();

            // Create PDF with custom configuration for receipt size
            $pdf = new \TCPDF('P', 'mm', [80, 250], true, 'UTF-8', false);

            // PDF Configuration
            $pdf->SetCreator('TekiPlanet');
            $pdf->SetAuthor($user->first_name . ' ' . $user->last_name);
            $pdf->SetTitle('Transaction Receipt');
            $pdf->SetSubject('Transaction Details');
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            $pdf->SetMargins(7, 7, 7);
            $pdf->AddPage();

            // Modern Color Palette with Gradient Effect
            $colors = [
                'background' => [255, 255, 255],       // White
                'primary' => [41, 128, 185],           // Vibrant Blue
                'secondary' => [52, 152, 219],         // Bright Blue
                'text_dark' => [44, 62, 80],           // Dark Blue-Gray
                'text_light' => [127, 140, 141],       // Gray
                'accent' => [22, 160, 133],            // Teal
                'border' => [230, 230, 230]            // Light Gray
            ];

            // Background with Subtle Gradient Effect
            $pdf->SetFillColor($colors['background'][0], $colors['background'][1], $colors['background'][2]);
            $pdf->Rect(0, 0, $pdf->getPageWidth(), $pdf->getPageHeight(), 'F');

            // Header with Modern Typography and Gradient Effect
            $pdf->SetFont('helvetica', 'B', 14);
            $pdf->SetTextColor($colors['primary'][0], $colors['primary'][1], $colors['primary'][2]);
            $pdf->Cell(0, 10, 'TEKIPLANET', 0, 1, 'C');
            
            $pdf->SetFont('helvetica', '', 9);
            $pdf->SetTextColor($colors['text_light'][0], $colors['text_light'][1], $colors['text_light'][2]);
            $pdf->Cell(0, 6, 'TRANSACTION RECEIPT', 0, 1, 'C');

            // Decorative Line with Gradient Effect
            $pdf->SetLineWidth(0.4);
            $pdf->SetDrawColor($colors['secondary'][0], $colors['secondary'][1], $colors['secondary'][2]);
            $pdf->Line(10, 25, $pdf->getPageWidth() - 10, 25);

            // Transaction Details Section
            $pdf->SetFont('helvetica', '', 9);
            $pdf->Ln(10);

            // Prepare Amount with NGN Currency
            $formattedAmount = 'NGN ' . number_format($transaction->amount, 2, '.', ',');

            // Details Array with Improved Formatting
            $details = [
                ['label' => 'Transaction ID', 'value' => $transactionId],
                ['label' => 'Date', 'value' => $transaction->created_at->format('d M Y H:i')],
                ['label' => 'Type', 'value' => strtoupper($transaction->type)],
                ['label' => 'Description', 'value' => $transaction->description ?? 'N/A'],
                ['label' => 'Amount', 'value' => $formattedAmount]
            ];

            // Modern Flat Design Table with Enhanced Styling
            foreach ($details as $detail) {
                // Label styling
                $pdf->SetTextColor($colors['text_dark'][0], $colors['text_dark'][1], $colors['text_dark'][2]);
                
                // Special handling for Transaction ID to place label above value
                if ($detail['label'] === 'Transaction ID') {
                    // Label centered
                    $pdf->SetFont('helvetica', 'B', 9);
                    $pdf->Cell(0, 7, $detail['label'], 0, 1, 'C');
                    
                    // Value centered and in a lighter color
                    $pdf->SetFont('helvetica', '', 8);
                    $pdf->SetTextColor($colors['text_light'][0], $colors['text_light'][1], $colors['text_light'][2]);
                    $pdf->Cell(0, 7, $detail['value'], 0, 1, 'C');
                    
                    // Subtle separator
                    $pdf->SetDrawColor($colors['border'][0], $colors['border'][1], $colors['border'][2]);
                    $pdf->Line(10, $pdf->GetY(), $pdf->getPageWidth() - 10, $pdf->GetY());
                } else {
                    // Original styling for other details
                    $pdf->Cell(35, 7, $detail['label'] . ':', 0, 0, 'L');
                    
                    // Value styling
                    if ($detail['label'] === 'Amount') {
                        $pdf->SetTextColor($transaction->type === 'credit' ? 
                            [0, 128, 0] :     // Green for credit
                            [255, 0, 0]       // Red for debit
                        );
                    } else {
                        $pdf->SetTextColor($colors['text_light'][0], $colors['text_light'][1], $colors['text_light'][2]);
                    }
                    
                    $pdf->Cell(0, 7, $detail['value'], 0, 1, 'R');
                    
                    // Subtle separator
                    $pdf->SetDrawColor($colors['border'][0], $colors['border'][1], $colors['border'][2]);
                    $pdf->Line(10, $pdf->GetY(), $pdf->getPageWidth() - 10, $pdf->GetY());
                }
            }

            // User Details Section with Modern Styling
            $pdf->Ln(5);
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetTextColor($colors['accent'][0], $colors['accent'][1], $colors['accent'][2]);
            $pdf->Cell(0, 8, 'ACCOUNT DETAILS', 0, 1, 'C');

            $pdf->SetFont('helvetica', '', 9);
            $pdf->SetTextColor($colors['text_dark'][0], $colors['text_dark'][1], $colors['text_dark'][2]);
            
            // User Details with Subtle Styling
            $userDetails = [
                ['label' => 'Name', 'value' => $user->first_name . ' ' . $user->last_name],
                ['label' => 'Email', 'value' => $user->email]
            ];

            foreach ($userDetails as $detail) {
                $pdf->Cell(35, 6, $detail['label'] . ':', 0, 0, 'L');
                $pdf->Cell(0, 6, $detail['value'], 0, 1, 'R');
            }

            // Footer with Subtle Styling
            $pdf->SetY(-20);
            $pdf->SetFont('helvetica', 'I', 7);
            $pdf->SetTextColor($colors['text_light'][0], $colors['text_light'][1], $colors['text_light'][2]);
            $pdf->Cell(0, 5, 'Secure Digital Banking', 0, 1, 'C');
            $pdf->Cell(0, 4, 'Generated by TekiPlanet', 0, 1, 'C');

            // Output PDF
            $pdfContent = $pdf->Output('transaction-receipt.pdf', 'S');

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=transaction-receipt.pdf");

        } catch (\Exception $e) {
            // Log the full error for debugging
            Log::error('Receipt Generation Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'transaction_id' => $transactionId,
                'user_id' => Auth::id()
            ]);

            // Return a more informative error response
            return response()->json([
                'error' => 'Failed to generate receipt PDF',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
