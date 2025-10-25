import copy
import pytest
from fastapi.testclient import TestClient

from src import app as app_module


@pytest.fixture(autouse=True)
def reset_activities():
    # Keep a deep copy of the original in-memory DB and restore after each test
    original = copy.deepcopy(app_module.activities)
    yield
    app_module.activities.clear()
    app_module.activities.update(original)


def test_get_activities():
    client = TestClient(app_module.app)
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert "Chess Club" in data


def test_signup_and_prevent_duplicate():
    client = TestClient(app_module.app)
    activity = "Chess Club"
    email = "teststudent@mergington.edu"

    # Signup should succeed
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert resp.json()["message"] == f"Signed up {email} for {activity}"

    # Participant must now be present
    resp = client.get("/activities")
    assert email in resp.json()[activity]["participants"]

    # Duplicate signup should fail with 400
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 400


def test_remove_participant():
    client = TestClient(app_module.app)
    activity = "Programming Class"
    # ensure an existing participant is present
    existing = app_module.activities[activity]["participants"][0]

    # Delete should succeed
    resp = client.delete(f"/activities/{activity}/participants?email={existing}")
    assert resp.status_code == 200
    assert resp.json()["message"] == f"Removed {existing} from {activity}"

    # Deleting again should return 404
    resp = client.delete(f"/activities/{activity}/participants?email={existing}")
    assert resp.status_code == 404
