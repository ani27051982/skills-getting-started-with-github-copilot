def test_get_activities_returns_seeded_data(client):
    # Arrange

    # Act
    response = client.get("/activities")
    payload = response.json()

    # Assert
    assert response.status_code == 200
    assert "Chess Club" in payload
    assert payload["Chess Club"]["participants"] == [
        "michael@mergington.edu",
        "daniel@mergington.edu",
    ]


def test_signup_success_adds_participant(client):
    # Arrange
    email = "newstudent@mergington.edu"

    # Act
    response = client.post("/activities/Chess%20Club/signup", params={"email": email})
    activities_after = client.get("/activities").json()

    # Assert
    assert response.status_code == 200
    assert activities_after["Chess Club"]["participants"][-1] == email


def test_signup_unknown_activity_returns_404(client):
    # Arrange

    # Act
    response = client.post("/activities/Unknown%20Club/signup", params={"email": "student@mergington.edu"})

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_signup_duplicate_returns_400(client):
    # Arrange
    duplicate_email = "michael@mergington.edu"

    # Act
    response = client.post("/activities/Chess%20Club/signup", params={"email": duplicate_email})

    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up for this activity"


def test_unregister_success_removes_participant(client):
    # Arrange
    email = "michael@mergington.edu"

    # Act
    response = client.delete("/activities/Chess%20Club/signup", params={"email": email})
    activities_after = client.get("/activities").json()

    # Assert
    assert response.status_code == 200
    assert email not in activities_after["Chess Club"]["participants"]


def test_unregister_unknown_activity_returns_404(client):
    # Arrange

    # Act
    response = client.delete("/activities/Unknown%20Club/signup", params={"email": "student@mergington.edu"})

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_unregister_non_member_returns_404(client):
    # Arrange
    email = "notregistered@mergington.edu"

    # Act
    response = client.delete("/activities/Chess%20Club/signup", params={"email": email})

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Student is not signed up for this activity"


def test_signup_then_unregister_preserves_mutation_integrity(client):
    # Arrange
    email = "flowstudent@mergington.edu"

    # Act
    before = client.get("/activities").json()["Soccer Team"]["participants"]
    signup_response = client.post("/activities/Soccer%20Team/signup", params={"email": email})
    after_signup = client.get("/activities").json()["Soccer Team"]["participants"]
    unregister_response = client.delete("/activities/Soccer%20Team/signup", params={"email": email})
    after_unregister = client.get("/activities").json()["Soccer Team"]["participants"]

    # Assert
    assert signup_response.status_code == 200
    assert unregister_response.status_code == 200
    assert email not in before
    assert email in after_signup
    assert email not in after_unregister
