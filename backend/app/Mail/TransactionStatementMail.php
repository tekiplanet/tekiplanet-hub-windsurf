<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TransactionStatementMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pdfContent;
    public $user;
    public $startDate;
    public $endDate;
    public $transactions;

    /**
     * Create a new message instance.
     */
    public function __construct($user, $startDate, $endDate, $transactions, $pdfContent = null)
    {
        $this->user = $user;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->transactions = $transactions;
        $this->pdfContent = $pdfContent;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        // Safely get user details
        $userName = is_object($this->user) ? 
            ($this->user->first_name ?? $this->user->name ?? 'User') : 
            'User';

        $email = $this->subject('Your TekiPlanet Transaction Statement')
            ->view('emails.transaction-statement-email')
            ->with([
                'userName' => $userName,
                'startDate' => $this->startDate,
                'endDate' => $this->endDate,
                'transactions' => $this->transactions
            ]);

        // Attach PDF if content is available
        if ($this->pdfContent) {
            $email->attachData(
                $this->pdfContent, 
                'transaction_statement.pdf', 
                ['mime' => 'application/pdf']
            );
        }

        return $email;
    }
}
