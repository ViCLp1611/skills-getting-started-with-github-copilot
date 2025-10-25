document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

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

  // New script to render activities and participants
  async function loadActivities() {
    try {
      const res = await fetch('/activities');
      if (!res.ok) throw new Error('Failed to load activities');
      const activities = await res.json();

      activitiesList.innerHTML = '';
      // Populate select first option remains
      Object.keys(activities).forEach((name) => {
        const activity = activities[name];

        // Add option to select
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        activitySelect.appendChild(opt);

        // Build activity card
        const card = document.createElement('div');
        card.className = 'activity-card';

        const title = document.createElement('h4');
        title.textContent = name;
        card.appendChild(title);

        const desc = document.createElement('p');
        desc.textContent = activity.description;
        card.appendChild(desc);

        const sched = document.createElement('p');
        sched.innerHTML = `<strong>Schedule:</strong> ${activity.schedule}`;
        card.appendChild(sched);

        const cap = document.createElement('p');
        cap.innerHTML = `<strong>Capacity:</strong> ${activity.participants.length} / ${activity.max_participants}`;
        card.appendChild(cap);

        // Participants section
        const partWrap = document.createElement('div');
        partWrap.className = 'activity-participants';

        const partTitle = document.createElement('h5');
        partTitle.textContent = 'Participants';
        partWrap.appendChild(partTitle);

        if (activity.participants && activity.participants.length > 0) {
          const ul = document.createElement('ul');
          ul.className = 'participants-list';
          activity.participants.forEach((email) => {
            const li = document.createElement('li');
            li.textContent = email;
            ul.appendChild(li);
          });
          partWrap.appendChild(ul);
        } else {
          const empty = document.createElement('div');
          empty.className = 'participants-empty';
          empty.textContent = 'No participants yet.';
          partWrap.appendChild(empty);
        }

        card.appendChild(partWrap);
        activitiesList.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      activitiesList.innerHTML = '<p class="error">Could not load activities.</p>';
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

  // Initialize app
  fetchActivities();
});
