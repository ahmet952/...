const clock = document.getElementById("clock");
const date = document.getElementById("date");
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const alarmSound = document.getElementById("alarm-sound");

const confirmBox = document.getElementById("confirm-box");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");
const clearAll = document.getElementById("clear-all");

// Saat ve tarih
setInterval(() => {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString("tr-TR");
  date.textContent = now.toLocaleDateString("tr-TR");
}, 1000);

// Sayfa yüklenince görevleri getir
window.addEventListener("load", () => {
  const saved = localStorage.getItem("tasks");
  if (saved) {
    taskList.innerHTML = saved;
    document.querySelectorAll("#task-list li").forEach(addDragEvents);
  }
});

// Görevleri kaydet
function saveTasks() {
  localStorage.setItem("tasks", taskList.innerHTML);
}

// Görev ekle
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const time = document.getElementById("task-time").value;
  const desc = document.getElementById("task-desc").value;

  const li = document.createElement("li");
  li.setAttribute("draggable", "true");
  li.innerHTML = `
    <span>${time} - ${desc}</span>
    <div>
      <button onclick="markDone(this)">✔</button>
      <button onclick="deleteTask(this)">🗑</button>
    </div>
  `;
  addDragEvents(li);
  taskList.appendChild(li);
  saveTasks();

  // Alarm kur
  const now = new Date();
  const taskTime = new Date();
  const [hour, minute] = time.split(":");
  taskTime.setHours(hour);
  taskTime.setMinutes(minute);
  taskTime.setSeconds(0);

  const diff = taskTime.getTime() - now.getTime();
  if (diff > 0) {
    setTimeout(() => {
      alarmSound.play().catch((error) => {
        console.warn("Ses çalınamadı. Tarayıcı engelleyebilir.", error);
      });
    }, diff);
  }

  taskForm.reset();
});

// Görevi tamamlandı yap
function markDone(btn) {
  btn.closest("li").classList.toggle("done");
  saveTasks();
}

// Görevi sil
function deleteTask(btn) {
  btn.closest("li").remove();
  saveTasks();
}

// Tümünü sil
clearAll.addEventListener("click", () => {
  confirmBox.classList.remove("hidden");
});

confirmYes.addEventListener("click", () => {
  taskList.innerHTML = "";
  saveTasks();
  confirmBox.classList.add("hidden");
});

confirmNo.addEventListener("click", () => {
  confirmBox.classList.add("hidden");
});

// Sürükle-bırak görev sıralama
let dragSrcEl = null;
function addDragEvents(item) {
  item.addEventListener("dragstart", function (e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.innerHTML);
  });

  item.addEventListener("dragover", function (e) {
    e.preventDefault();
    return false;
  });

  item.addEventListener("drop", function (e) {
    e.stopPropagation();
    if (dragSrcEl !== this) {
      dragSrcEl.innerHTML = this.innerHTML;
      this.innerHTML = e.dataTransfer.getData("text/html");
      saveTasks();
    }
    return false;
  });
}

// Ses izni
const enableBtn = document.getElementById("enable-sound");
if (enableBtn) {
  enableBtn.addEventListener("click", () => {
    alarmSound.play().then(() => {
      alarmSound.pause();
      alarmSound.currentTime = 0;
      enableBtn.remove();
      alert("Ses izni verildi!");
    }).catch((err) => {
      alert("Ses izni alınamadı: " + err);
    });
  });
}
