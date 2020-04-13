//* Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
//* Init http module
const http = customHttp();

//! servise for server
const newsServise = (function () {
  const apiKey = "b74aa85de1074e34b0f1e27a5f6719cb";
  const apiUrl = "https://newsapi.org/v2";

  return {
    topHeadlines(country = "ru", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

//! elemets UI
const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const searchInput = form.elements["search"];

//* event listener for form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
});

//*  init selects
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  loadNews();
});

//* load news function
function loadNews() {
  showLoader()

  const country = countrySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsServise.topHeadlines(country, onGetResponse);
  } else {
    newsServise.everything(searchText, onGetResponse);
  }
}

//* function on get response from server
function onGetResponse(err, res) {
  removeLoader()

  if (err) {
    showAlert(err, "error-msg");
    return;
  }

  renderNews(res.articles);
}

//* function render news
function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = "";

  news.forEach((newsItem) => {
    const el = tamplateNewsItem(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

//* function for cear container
function clearContainer(container) {
  let child = container.lastElementChild;

  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

//* function tamplate news item
function tamplateNewsItem({ description, title, url, urlToImage }) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage || ""}">
          <span class="card-title">${title || ""}</span>
        </div>
        <div class="card-content">
          <p>${description || ""}</p>
        </div>
        <div class ="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
`;
}

//* function show alert
function showAlert(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

//* function show loader
function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="progress">
      <div class="indeterminate"></div>
    </div>`
  );
}

//* function remove loader
function removeLoader(){
  let loader = document.querySelector('.progress')
  if(loader){
    loader.remove()
  }
}
