const newsContainer = document.getElementById('news-container');
const apiKey = '4f648e11d8a547a4a29911d6d6d197ab'; // Replace with your actual API key
const defaultCategory = 'technology';
let currentCategory = defaultCategory;
let currentQuery = '';

function getApiUrl() {
    if (currentQuery) {
        return `https://newsapi.org/v2/everything?q=${currentQuery}&apiKey=${apiKey}`;
    }
    return `https://newsapi.org/v2/top-headlines?country=us&category=${currentCategory}&apiKey=${apiKey}`;
}

async function fetchNews() {
    const apiUrl = getApiUrl();
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayNews(data.articles);
        lazyLoadImages();
    } catch (error) {
        console.error("Could not fetch news:", error);
        newsContainer.innerHTML = '<p>Could not fetch news. Please check your API key or network connection.</p>';
    }
}

let headlines = [];
let currentHeadlineIndex = 0;

function displayNews(articles) {
    newsContainer.innerHTML = '';
    headlines = articles.slice(0, 5); // Take the first 5 articles as headlines
    const remainingArticles = articles.slice(5);

    displayCurrentHeadline();

    remainingArticles.forEach((article, index) => {
        if (article.title && article.description && article.url) {
            const articleEl = document.createElement('div');
            articleEl.classList.add('news-article');
            articleEl.style.animationDelay = `${index * 0.1}s`;
            articleEl.classList.add('grid-item');

            let image = '';
            if (article.urlToImage) {
                image = `<img data-src="${article.urlToImage}" alt="${article.title}" class="lazy-load">`;
            }

            articleEl.dataset.url = article.url;
            articleEl.innerHTML = `
                <div class="article-image-container">${image}</div>
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p class="description">${article.description}</p>
                    <div class="preview-container"></div>
                </div>
            `;
            newsContainer.appendChild(articleEl);
        }
    });
}

const categoryLinks = document.querySelectorAll('.category');
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');

categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        currentCategory = e.target.dataset.category;
        currentQuery = '';
        searchInput.value = '';
        categoryLinks.forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        fetchNews();
    });
});

searchButton.addEventListener('click', () => {
    currentQuery = searchInput.value;
    if (currentQuery) {
        currentCategory = '';
        categoryLinks.forEach(l => l.classList.remove('active'));
        fetchNews();
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});

const prevHeadlineBtn = document.getElementById('prev-headline');
const nextHeadlineBtn = document.getElementById('next-headline');

function displayCurrentHeadline() {
    const currentHeadline = document.getElementById('current-headline');
    currentHeadline.classList.add('fade-out');

    setTimeout(() => {
        if (headlines.length > 0) {
            const headline = headlines[currentHeadlineIndex];
            
            let bgDiv = '';
            if (headline.urlToImage) {
                const safeUrl = headline.urlToImage.replace(/'/g, "\\'").replace(/"/g, '\\"');
                bgDiv = `<div class="headline-bg" style="background-image: url('${safeUrl}')"></div>`;
            }

            currentHeadline.dataset.url = headline.url;
            currentHeadline.innerHTML = `
                ${bgDiv}
                <div class="headline-content">
                    <h2>${headline.title}</h2>
                    <p>${headline.description}</p>
                </div>
            `;
        } else {
            currentHeadline.innerHTML = '';
        }
        currentHeadline.classList.remove('fade-out');
        currentHeadline.classList.add('fade-up');
    }, 500);
}

prevHeadlineBtn.addEventListener('click', () => {
    if (headlines.length > 0) {
        currentHeadlineIndex = (currentHeadlineIndex - 1 + headlines.length) % headlines.length;
        displayCurrentHeadline();
    }
});

nextHeadlineBtn.addEventListener('click', () => {
    if (headlines.length > 0) {
        currentHeadlineIndex = (currentHeadlineIndex + 1) % headlines.length;
        displayCurrentHeadline();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevHeadlineBtn.click();
    } else if (e.key === 'ArrowRight') {
        nextHeadlineBtn.click();
    }
});

function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('.lazy-load');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target;
                image.src = image.dataset.src;
                image.classList.add('loaded');
                observer.unobserve(image);
            }
        });
    });

    lazyImages.forEach(image => {
        imageObserver.observe(image);
    });
}

document.addEventListener('mouseover', event => {
    if (event.target.matches('.news-article')) {
        const article = event.target;
        const previewContainer = article.querySelector('.preview-container');
        if (!previewContainer.querySelector('iframe')) {
            const url = article.querySelector('h3 a').href;
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            previewContainer.appendChild(iframe);
        }
    }
});

newsContainer.addEventListener('click', event => {
    const articleEl = event.target.closest('.news-article');
    if (articleEl && !event.target.closest('a, button, iframe')) {
        window.open(articleEl.dataset.url, '_blank');
    }
});

document.getElementById('current-headline').addEventListener('click', event => {
    const headlineEl = event.currentTarget;
    if (headlineEl.dataset.url && !event.target.closest('a, button')) {
        window.open(headlineEl.dataset.url, '_blank');
    }
});

// Set the initial active category
document.querySelector(`.category[data-category="${defaultCategory}"]`).classList.add('active');

fetchNews();
document.addEventListener('mousemove', e => {
    const glow = document.getElementById('cursor-glow');
    glow.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
});