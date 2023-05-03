function waitForNavbarAndAddLanguageNavigation() {

    // Select the target node to observe for changes
    const targetNode = document.getElementById("navbar");

    // If the target node is not found, display an error and exit
    if (!targetNode) {
        console.log('Navbar element not found');
        return;
    }

    // Callback function to execute when the desired element is injected
    const callback = function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const navElement = document.querySelector('.navbar-nav');
                if (navElement) {

                    // Call your function to add the language navigation
                    addLanguageNavigation();

                    // Disconnect the observer once the element is found
                    observer.disconnect();

                    return;
                }
            }
        }
    };

    // Create an observer instance with the callback function
    const observer = new MutationObserver(callback);

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
}

function addLanguageNavigation() {

    //const navElement = document.getElementById('navbar');
    const navElement = document.querySelector('.navbar-nav');

    if (!navElement) {
        console.log('Navbar not found');
        return;
    }

    //const languageList = document.createElement('ul');
    //languageList.classList.add('navbar-nav');

    const languageDropdown = document.createElement('li');
    languageDropdown.classList.add('nav-item', 'dropdown');

    const languageDropdownLink = document.createElement('a');
    languageDropdownLink.classList.add('nav-link', 'dropdown-toggle');
    languageDropdownLink.href = '#';
    languageDropdownLink.role = 'button';
    languageDropdownLink.setAttribute('data-bs-toggle', 'dropdown');
    languageDropdownLink.setAttribute('aria-expanded', 'false');
    languageDropdownLink.textContent = '🌐';

    const dropdownMenu = document.createElement('ul');
    dropdownMenu.classList.add('dropdown-menu');

    const englishItem = document.createElement('li');
    const englishLink = document.createElement('a');
    englishLink.classList.add('dropdown-item');
    englishLink.href = '#'; // Replace with the link to the English version of the page
    englishLink.textContent = 'English';
    englishItem.appendChild(englishLink);

    const japaneseItem = document.createElement('li');
    const japaneseLink = document.createElement('a');
    japaneseLink.classList.add('dropdown-item');
    japaneseLink.href = '#'; // Replace with the link to the Japanese version of the page
    japaneseLink.textContent = 'Japanese';
    japaneseItem.appendChild(japaneseLink);

    dropdownMenu.appendChild(englishItem);
    dropdownMenu.appendChild(japaneseItem);
    languageDropdown.appendChild(languageDropdownLink);
    languageDropdown.appendChild(dropdownMenu);
    //languageList.appendChild(languageDropdown);
    //navElement.appendChild(languageList);
    navElement.appendChild(languageDropdown);
}

function addVersionNavigation() {
    const version = document.getElementById("toc");
    const selectHtml = `
        <select id="stride-current-version" class="form-select" aria-label="Default select example">
            <option selected>Latest</option>
        </select>
    `;
    version.insertAdjacentHTML("afterbegin", selectHtml);
}

function loadVersions() {
    fetch('/versions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error loading versions.json: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const selectElement = document.getElementById("stride-current-version");
            selectElement.innerHTML = '';

            // Add the "Latest" option
            //const latestOption = document.createElement('option');
            //latestOption.value = 'latest';
            //latestOption.textContent = 'Latest';
            //selectElement.appendChild(latestOption);

            data.versions.forEach(version => {
                const url = version;
                const option = document.createElement('option');
                option.value = url;
                option.textContent = version;
                selectElement.appendChild(option);
            });

            const urlSplits = window.location.pathname.split('/');
            let urlVersion = urlSplits[1];
            if (urlVersion === 'latest') {
                urlVersion = data.versions[0];
            }

            selectElement.value = urlVersion;
            selectElement.dispatchEvent(new Event('change'));
            redirectToCurrentDocVersion();
        }).catch(error => {
            console.log('Error loading or processing versions.json:', error);
        });
}

function redirectToCurrentDocVersion() {
    const selectElement = document.getElementById('stride-current-version');
    selectElement.addEventListener('change', function () {
        const hostVersion = window.location.host;
        const pathVersion = window.location.pathname;
        const targetVersion = selectElement.value;

        // Generate page URL in other version
        let newAddress = '//' + hostVersion + '/' + targetVersion + '/' + pathVersion.substring(pathVersion.indexOf('/', 1) + 1);

        // Check if address exists
        fetch(newAddress, { method: 'HEAD' })
            .then(response => {
                if (!response.ok) {
                    // It didn't work, let's just go to the top page of the section (i.e. manual, api, release notes, etc.)
                    newAddress = '//' + hostVersion + '/' + targetVersion + '/' + pathVersion.split('/')[2];
                    if (pathVersion.split('/').length >= 4) {
                        newAddress += '/' + pathVersion.split('/')[3];
                    }
                }
            })
            .catch(error => {
                console.error('Error checking URL:', error);
            })
            .finally(() => {
                // Go to page
                window.location.href = newAddress;
            });
    });
}


function start() {

    // Call the function to start waiting for the navbar element
    waitForNavbarAndAddLanguageNavigation();

    addVersionNavigation()
    loadVersions();
}

document.addEventListener("DOMContentLoaded", start);