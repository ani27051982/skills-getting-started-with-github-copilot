import pytest
from fastapi.testclient import TestClient

from src.app import build_seed_activities, create_app


@pytest.fixture
def client():
    # Arrange: Build a fresh app instance with isolated in-memory state.
    app = create_app(initial_activities=build_seed_activities())

    with TestClient(app) as test_client:
        yield test_client
