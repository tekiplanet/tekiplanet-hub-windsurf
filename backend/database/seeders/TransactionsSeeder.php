<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TransactionsSeeder extends Seeder
{
    public function run()
    {
        $transactions = [
            // Credit Transactions (Funding)
            ['type' => 'credit', 'description' => 'Initial Account Funding', 'amount' => 1000.00, 'category' => 'Initial Deposit', 'payment_method' => 'Bank Transfer'],
            ['type' => 'credit', 'description' => 'Salary Deposit', 'amount' => 2500.50, 'category' => 'Salary', 'payment_method' => 'Direct Deposit'],
            ['type' => 'credit', 'description' => 'Freelance Work Payment', 'amount' => 750.25, 'category' => 'Freelance', 'payment_method' => 'PayPal'],
            ['type' => 'credit', 'description' => 'Investment Dividend', 'amount' => 350.75, 'category' => 'Investments', 'payment_method' => 'Bank Transfer'],
            ['type' => 'credit', 'description' => 'Refund from Online Purchase', 'amount' => 45.99, 'category' => 'Refund', 'payment_method' => 'Credit Card'],

            // Debit Transactions (Spending)
            ['type' => 'debit', 'description' => 'Grocery Shopping', 'amount' => 87.50, 'category' => 'Groceries', 'payment_method' => 'Debit Card'],
            ['type' => 'debit', 'description' => 'Restaurant Dinner', 'amount' => 65.25, 'category' => 'Dining', 'payment_method' => 'Credit Card'],
            ['type' => 'debit', 'description' => 'Monthly Subscription', 'amount' => 12.99, 'category' => 'Subscriptions', 'payment_method' => 'Online Payment'],
            ['type' => 'debit', 'description' => 'Utility Bill', 'amount' => 95.75, 'category' => 'Utilities', 'payment_method' => 'Bank Transfer'],
            ['type' => 'debit', 'description' => 'Online Course', 'amount' => 199.00, 'category' => 'Education', 'payment_method' => 'Credit Card'],

            // More varied transactions
            ['type' => 'credit', 'description' => 'Birthday Gift', 'amount' => 100.00, 'category' => 'Gift', 'payment_method' => 'Cash'],
            ['type' => 'debit', 'description' => 'New Shoes', 'amount' => 129.99, 'category' => 'Shopping', 'payment_method' => 'Debit Card'],
            ['type' => 'debit', 'description' => 'Gym Membership', 'amount' => 49.99, 'category' => 'Fitness', 'payment_method' => 'Recurring Payment'],
            ['type' => 'credit', 'description' => 'Bonus at Work', 'amount' => 500.00, 'category' => 'Bonus', 'payment_method' => 'Direct Deposit'],
            ['type' => 'debit', 'description' => 'Car Maintenance', 'amount' => 250.50, 'category' => 'Transportation', 'payment_method' => 'Cash'],

            // More random transactions
            ['type' => 'debit', 'description' => 'Movie Tickets', 'amount' => 35.00, 'category' => 'Entertainment', 'payment_method' => 'Credit Card'],
            ['type' => 'credit', 'description' => 'Tax Refund', 'amount' => 750.00, 'category' => 'Tax Refund', 'payment_method' => 'Bank Transfer'],
            ['type' => 'debit', 'description' => 'Home Supplies', 'amount' => 75.25, 'category' => 'Household', 'payment_method' => 'Debit Card'],
            ['type' => 'debit', 'description' => 'Coffee Shops', 'amount' => 45.50, 'category' => 'Food & Drink', 'payment_method' => 'Mobile Payment'],
            ['type' => 'credit', 'description' => 'Side Hustle Income', 'amount' => 300.00, 'category' => 'Side Income', 'payment_method' => 'PayPal'],

            // Final batch
            ['type' => 'debit', 'description' => 'Book Purchase', 'amount' => 29.99, 'category' => 'Books', 'payment_method' => 'Online Store'],
            ['type' => 'debit', 'description' => 'Software Subscription', 'amount' => 19.99, 'category' => 'Subscriptions', 'payment_method' => 'Credit Card'],
            ['type' => 'credit', 'description' => 'Cashback Reward', 'amount' => 25.00, 'category' => 'Rewards', 'payment_method' => 'Credit Card'],
            ['type' => 'debit', 'description' => 'Phone Bill', 'amount' => 55.00, 'category' => 'Utilities', 'payment_method' => 'Bank Transfer'],
            ['type' => 'debit', 'description' => 'Internet Service', 'amount' => 69.99, 'category' => 'Utilities', 'payment_method' => 'Recurring Payment'],
            ['type' => 'credit', 'description' => 'Loan Repayment', 'amount' => 1000.00, 'category' => 'Loan', 'payment_method' => 'Bank Transfer'],
            ['type' => 'debit', 'description' => 'Health Supplements', 'amount' => 89.50, 'category' => 'Health', 'payment_method' => 'Debit Card']
        ];

        // Add common fields and randomize dates
        $finalTransactions = array_map(function($transaction) {
            return array_merge($transaction, [
                'id' => Str::uuid(),
                'user_id' => '55893c53-1701-4a47-ab85-5b7b03b82bf8', // Always user with id 1
                'status' => 'completed',
                'created_at' => Carbon::now()->subDays(rand(1, 90)),
                'updated_at' => Carbon::now(),
                'notes' => null
            ]);
        }, $transactions);

        DB::table('transactions')->insert($finalTransactions);
    }
}