let menuIcon = document.querySelector('.menu-icon');
let menu = document.querySelector('.menu');
let overlay = document.querySelector('.overlay');

menuIcon.addEventListener('click', () => {
    menu.classList.toggle('active');
    menuIcon.classList.toggle('active');
    overlay.classList.toggle('active');
    document.querySelectorAll('.menu').forEach(item => {
        item.addEventListener('click', () => {
            menu.classList.remove('active');
            menuIcon.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
});


let loader = document.querySelector('.loader');
let shortenBtn = document.querySelector('.shorten-btn'); 
let linkInput = document.querySelector('.link-input');
let linksContainer = document.querySelector('.links-shorten');
let errorMsg = document.querySelector('.error-msg');

window.addEventListener('keypress', (e) => {
    if (e.key == 'Enter') {
        getShortLink();
    }
});


let shortenLinks = JSON.parse(localStorage.getItem('links'));
if (shortenLinks) {
    shortenLinks.map((url) => {
        createLinkContainer(url.shortLink, url.id, url.longLink);
    });
}


shortenBtn.addEventListener('click', getShortLink);
linkInput.onfocus = () => {
    linkInput.style.borderColor = 'hsl(180, 66%, 49%)';
};
linkInput.onblur = () => {
    linkInput.style.borderColor = 'transparent';
};

function getShortLink() {
    if (linkInput.value == '') {
        errorMsg.style.display = 'block';
        errorMsg.innerText = 'Please add a link first';
        linkInput.style.borderColor = 'hsl(0, 87%, 67%)';
    } else {
        overlay.classList.add('active');
        loader.classList.add('active');
        fetch(`https://api.shrtco.de/v2/shorten?url=${linkInput.value}`)
            .then(result => result.json()).then(
                data => {
                    overlay.classList.remove('active');
                    loader.classList.remove('active');
                    if (!data.ok) {
                        errorMsg.style.display = 'block';
                        errorMsg.innerText = data.error;
                        linkInput.style.borderColor = 'hsl(0, 87%, 67%)';
                    } else {
                        errorMsg.style.display = 'none';
                        linkInput.style.borderColor = 'transparent';
                        let id = Date.now().toString(32).slice(0, 6);
                        createLinkContainer(data.result.full_short_link2, id, linkInput.value);
                    }
                    saveData();
                }).catch(function (err) {
                    errorMsg.style.display = 'block';
                    errorMsg.innerText = 'A problem happened, Try later';
                    linkInput.style.borderColor = 'hsl(0, 87%, 67%)';
                    return false;
                }
            );
    }
}

function createLinkContainer(shortLink, id, longLink) {
    let linkContainer = '';
    linkContainer += `<div class="link-shorten" id="${id}">
                        <div>
                            <a href="${longLink}" target="_blank" class="long-link">${longLink}</a>
                            <a href="${shortLink}" target="_blank" class="short-link">${shortLink}</a>
                            </div>
                        <div>
                            <button class="copy-link">copy</button>
                            <i class="fa-regular fa-trash-can delete-link"></i>
                            </div>
                            </div>`;
    linksContainer.innerHTML += linkContainer;
    linkInput.value = '';

    let linksContainers = document.querySelectorAll('.link-shorten');
    linksContainers.forEach(linkContainer => {
        let copyBtn = linkContainer.querySelector('.copy-link');
        let link = linkContainer.querySelector('.short-link');
        let deleteBtn = linkContainer.querySelector('.delete-link');
        copyBtn.addEventListener('click', () => copyText(link, copyBtn));
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerText = 'copy';
        }, 5000);
        deleteBtn.addEventListener('click', (e) => {
            e.target.parentElement.parentElement.remove();
            saveData();
        });
    });
};

function saveData() {
    let linksContainers = document.querySelectorAll('.link-shorten');
    shortenLinks = [];
    linksContainers.forEach(linkContainer => {
        shortenLinks.push({
            id: linkContainer.id,
            longLink: linkContainer.firstElementChild.firstElementChild.innerText,
            shortLink: linkContainer.firstElementChild.lastElementChild.innerText
        });
    });
    localStorage.setItem('links', JSON.stringify(shortenLinks));
}


function copyText(link, copyBtn) {
    let range = document.createRange();
    range.selectNode(link);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    copyBtn.classList.add('copied');
    copyBtn.innerText = 'copied!';
};