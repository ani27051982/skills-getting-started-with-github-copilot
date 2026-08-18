document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const signupButton = signupForm.querySelector('button[type="submit"]');
  let latestActivitiesRequestId = 0;

  const refreshStatus = document.createElement("div");
  refreshStatus.id = "activities-refresh-status";
  refreshStatus.className = "refresh-status hidden";
  refreshStatus.textContent = "Updating activities...";
  activitiesList.parentElement.insertBefore(refreshStatus, activitiesList);

  function setRefreshingActivities(isRefreshing) {
    activitiesList.classList.toggle("is-refreshing", isRefreshing);
    activitiesList.setAttribute("aria-busy", String(isRefreshing));
    refreshStatus.classList.toggle("hidden", !isRefreshing);

    if (signupButton) {
      signupButton.disabled = isRefreshing;
    }

    activitiesList
      .querySelectorAll(".remove-participant-button")
      .forEach((button) => {
        button.disabled = isRefreshing;
      });
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    const requestId = ++latestActivitiesRequestId;

    try {
      const response = await fetch("/activities", { cache: "no-store" });
      const activities = await response.json();

      // Ignore stale, out-of-order responses.
      if (requestId !== latestActivitiesRequestId) {
        return;
      }

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const title = document.createElement("h4");
        title.textContent = name;

        const description = document.createElement("p");
        description.textContent = details.description;

        const schedule = document.createElement("p");
        schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const availability = document.createElement("p");
        availability.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeading = document.createElement("p");
        participantsHeading.className = "participants-heading";
        participantsHeading.textContent = "Participants";

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (details.participants.length > 0) {
          details.participants.forEach((participant) => {
            const participantItem = document.createElement("li");

            const participantName = document.createElement("span");
            participantName.className = "participant-email";
            participantName.textContent = participant;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-participant-button";
            removeButton.setAttribute("aria-label", `Unregister ${participant} from ${name}`);
            removeButton.dataset.activity = name;
            removeButton.dataset.email = participant;
            removeButton.textContent = "×";

            participantItem.appendChild(participantName);
            participantItem.appendChild(removeButton);
            participantsList.appendChild(participantItem);
          });
        } else {
          const emptyStateItem = document.createElement("li");
          emptyStateItem.className = "participants-empty";
          emptyStateItem.textContent = "Be the first to sign up!";
          participantsList.appendChild(emptyStateItem);
        }

        participantsSection.appendChild(participantsHeading);
        participantsSection.appendChild(participantsList);

        activityCard.appendChild(title);
        activityCard.appendChild(description);
        activityCard.appendChild(schedule);
        activityCard.appendChild(availability);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        setRefreshingActivities(true);
        await fetchActivities();
        setRefreshingActivities(false);
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Handle participant removal
  activitiesList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (!target.classList.contains("remove-participant-button")) {
      return;
    }

    const activity = target.dataset.activity;
    const email = target.dataset.email;

    if (!activity || !email) {
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        setRefreshingActivities(true);
        await fetchActivities();
        setRefreshingActivities(false);
      } else {
        messageDiv.textContent = result.detail || "Failed to unregister participant";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering participant:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
