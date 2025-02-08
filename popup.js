document.addEventListener("DOMContentLoaded", function () {
  const saveBtn = document.getElementById("saveBtn");
  const removeAllBtn = document.getElementById("removeAllBtn");
  const searchInput = document.getElementById("searchInput");
  const tagsFilter = document.getElementById("tagsFilter");
  const sortFilter = document.getElementById("sortFilter");
  const toggleTheme = document.getElementById("toggleTheme");

  if (saveBtn) saveBtn.addEventListener("click", saveCurrentPage);
  if (removeAllBtn) removeAllBtn.addEventListener("click", removeAllUrls);
  if (searchInput) searchInput.addEventListener("input", renderSavedUrls);
  if (tagsFilter) tagsFilter.addEventListener("change", renderSavedUrls);
  if (sortFilter) sortFilter.addEventListener("change", renderSavedUrls);

  if (toggleTheme) {
      toggleTheme.addEventListener("click", function () {
          document.body.classList.toggle("dark-mode");
          toggleTheme.textContent = document.body.classList.contains("dark-mode") ? "🌞" : "🌙";
          localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
      });

      if (localStorage.getItem("darkMode") === "enabled") {
          document.body.classList.add("dark-mode");
          toggleTheme.textContent = "🌞";
      }
  }

  renderSavedUrls();
});

function saveCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs || tabs.length === 0) return;

      let url = tabs[0].url;
      let customTitle = prompt("Enter a custom name for this page:", tabs[0].title || "Saved Page");
      if (!customTitle) return;

      let tag = prompt("Enter a tag (optional):") || "Uncategorized";
      let note = prompt("Add a note (optional):") || "No notes added";

      chrome.storage.sync.get("urls", function (data) {
          let urls = data.urls || [];
          urls.push({ url, title: customTitle, tags: tag, note: note, dateAdded: Date.now() });
          chrome.storage.sync.set({ urls: urls }, renderSavedUrls);
      });
  });
}

function renderSavedUrls() {
  chrome.storage.sync.get("urls", function (data) {
      let urls = data.urls || [];
      let urlList = document.getElementById("urls");
      if (!urlList) return;

      urlList.innerHTML = "";

      urls.forEach(({ url, title, tags, note }) => {
          let li = document.createElement("li");
          li.classList.add("url-item");

          let contentDiv = document.createElement("div");
          contentDiv.classList.add("url-content");

          let link = document.createElement("a");
          link.href = url;
          link.textContent = title;
          link.target = "_blank";
          contentDiv.appendChild(link);

          let tagElement = document.createElement("span");
          tagElement.textContent = `🏷️ ${tags}`;
          tagElement.classList.add("tag");
          contentDiv.appendChild(tagElement);

          let noteElement = document.createElement("span");
          noteElement.textContent = `📝 ${note}`;
          noteElement.classList.add("note");
          contentDiv.appendChild(noteElement);

          li.appendChild(contentDiv);

          let removeButton = document.createElement("button");
          removeButton.textContent = "Remove";
          removeButton.classList.add("remove-button");
          removeButton.addEventListener("click", () => removeUrl(url));
          li.appendChild(removeButton);

          urlList.appendChild(li);
      });
  });
}

function removeAllUrls() {
  chrome.storage.sync.set({ urls: [] }, renderSavedUrls);
}

function removeUrl(urlToRemove) {
  chrome.storage.sync.get("urls", function (data) {
      let updatedUrls = data.urls.filter(entry => entry.url !== urlToRemove);
      chrome.storage.sync.set({ urls: updatedUrls }, renderSavedUrls);
  });
}   