from locust import HttpUser, between, task


class CliniGAAIUser(HttpUser):
    wait_time = between(0.5, 2.0)

    @task(3)
    def health(self):
        self.client.get('/health')

    @task(1)
    def skills(self):
        self.client.get('/skills')
