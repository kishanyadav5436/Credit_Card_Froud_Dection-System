from datetime import datetime


transactions = []


def save_transaction(transaction):
    transaction_id = transaction["transaction_id"]

    existing = get_transaction(transaction_id)

    if existing:
        return existing

    transaction["created_at"] = datetime.utcnow().isoformat()

    transactions.insert(0, transaction)

    return transaction


def get_transaction(transaction_id):
    for transaction in transactions:
        if transaction["transaction_id"] == transaction_id:
            return transaction

    return None


def get_all_transactions():
    return transactions