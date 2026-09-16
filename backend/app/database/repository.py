class TransactionRepository:

    def create(self, transaction):
        """
        Save a transaction into PostgreSQL.
        """

        query = """
        INSERT INTO transactions (
            transaction_id,
            customer_id,
            merchant_id,
            amount,
            currency,
            velocity,
            is_new_device,
            location_mismatch,
            risk_score,
            decision,
            severity,
            probability,
            reason_codes,
            reasons,
            model_version,
            latency_ms
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s
        )
        RETURNING transaction_id;
        """

        return query

    def get_by_id(self, transaction_id):
        """
        Get one transaction from PostgreSQL.
        """

        query = """
        SELECT
            transaction_id,
            customer_id,
            merchant_id,
            amount,
            currency,
            velocity,
            is_new_device,
            location_mismatch,
            risk_score,
            decision,
            severity,
            probability,
            reason_codes,
            reasons,
            model_version,
            latency_ms,
            created_at
        FROM transactions
        WHERE transaction_id = %s;
        """

        return query

    def get_all(self):
        """
        Get all transactions.
        """

        query = """
        SELECT
            transaction_id,
            customer_id,
            merchant_id,
            amount,
            currency,
            velocity,
            is_new_device,
            location_mismatch,
            risk_score,
            decision,
            severity,
            probability,
            reason_codes,
            reasons,
            model_version,
            latency_ms,
            created_at
        FROM transactions
        ORDER BY created_at DESC;
        """

        return query


transaction_repository = (
    TransactionRepository()
)