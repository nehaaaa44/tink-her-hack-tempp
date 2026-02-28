from flask import Flask, jsonify, request
import sqlite3
from datetime import datetime

import os

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'banko.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/statement/<customer>/<month>', methods=['GET'])
def get_statement(customer, month):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT date, category, amount, type, description 
        FROM transactions 
        WHERE customer = ? AND month = ? 
        ORDER BY date
    """, (customer, month))
    
    transactions = [dict(row) for row in cursor.fetchall()]
    
    # Calculate totals
    total_credit = sum(t['amount'] for t in transactions if t['type'] == 'CREDIT')
    total_debit = sum(t['amount'] for t in transactions if t['type'] == 'DEBIT')
    closing_balance = total_credit - total_debit
    
    conn.close()
    
    return jsonify({
        'customer': customer,
        'month': month,
        'total_credit': total_credit,
        'total_debit': total_debit,
        'closing_balance': closing_balance,
        'transactions': transactions
    })

@app.route('/customers', methods=['GET'])
def get_customers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM customers")
    customers = [row['name'] for row in cursor.fetchall()]
    conn.close()
    return jsonify({'customers': customers})

@app.route('/months', methods=['GET'])
def get_months():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT month FROM transactions ORDER BY month DESC")
    months = [row['month'] for row in cursor.fetchall()]
    conn.close()
    return jsonify({'months': months})

if __name__ == '__main__':
    print("🏦 Banko API running on http://localhost:5000")
    print("Endpoints: /statement/<customer>/<month>, /customers, /months")
    app.run(host='0.0.0.0', port=5000, debug=True)
