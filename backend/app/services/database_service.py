class DatabaseService:

    def __init__(self):
        self.connected = False

    def connect(self):
        """
        PostgreSQL connection will be
        implemented after the database
        driver is installed.
        """
        self.connected = True

    def disconnect(self):
        self.connected = False

    def is_connected(self):
        return self.connected


database_service = DatabaseService()