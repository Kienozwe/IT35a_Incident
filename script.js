let reports = JSON.parse(localStorage.getItem("reports")) || [];
let isAdmin = false;

function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

function login() {
  const user = document.getElementById("username").value;

  if (!user) {
    alert("Please enter a username");
    return;
  }

  if (user === "admin") {
    isAdmin = true;
    document.getElementById("adminNav").style.display = "block";
    showSection("admin");
  } else {
    isAdmin = false;
    document.getElementById("adminNav").style.display = "none";
    showSection("home");
  }

  alert(`Logged in as ${user}`);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      document.getElementById("location").value =
        `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;

      document.getElementById("time").value =
        new Date().toLocaleString();
    });
  } else {
    alert("Geolocation not supported");
  }
}

document.getElementById("reportForm").addEventListener("submit", e => {
  e.preventDefault();

  const report = {
    location: location.value,
    time: time.value,
    description: description.value
  };

  reports.push(report);
  localStorage.setItem("reports", JSON.stringify(reports));

  alert("Incident reported successfully!");
  loadReports();
  showSection("reports");
});

function loadReports() {
  const list = document.getElementById("reportList");
  list.innerHTML = "";

  reports.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.time} | ${r.location} | ${r.description}`;
    list.appendChild(li);
  });

  document.getElementById("totalReports").textContent = reports.length;
}

loadReports();

