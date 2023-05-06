const app = {
    iconLinks: [
        {
            icon: 'github',
            href: 'https://github.com/dotnet/docfx',
            title: 'GitHub'
        }
    ],
    waitForNavbarAndAddLanguageNavigation: function () {
        // Select the target node to observe for changes
        const targetNode = document.getElementById("navbar");

        // If the target node is not found, display an error and exit
        if (!targetNode) {
            console.log('Navbar element not found');
            return;
        }

        // Callback function to execute when the desired element is injected
        const callback = (mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const navElement = document.querySelector('.navbar-nav');
                    if (navElement) {

                        // Call your function to add the language navigation
                        this.addLanguageNavigation();

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
    },
    createLanguageLink: function (language) {

        const languageLink = document.createElement('a');
        languageLink.classList.add('dropdown-item');
        languageLink.href = language.href;
        languageLink.textContent = language.name;
        languageLink.role = 'button';
        languageLink.setAttribute('data-language', language.code);
        return languageLink;

    },
    createLanguageItem: function (language, pattern) {

        const languageItem = document.createElement('li');
        const languageLink = this.createLanguageLink(language);
        languageItem.appendChild(languageLink);

        languageLink.addEventListener('click', (event) => {
            event.preventDefault();
            const lang = "/" + event.target.getAttribute('data-language') + "/";
            window.location.href = window.location.href.replace(pattern, lang);
        });

        return languageItem;
    },
    createLanguageDropdown: function (languages, pattern) {

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

        languages.forEach(language => {
            const languageItem = this.createLanguageItem(language, pattern);
            dropdownMenu.appendChild(languageItem);
        });

        languageDropdown.appendChild(languageDropdownLink);
        languageDropdown.appendChild(dropdownMenu);

        return languageDropdown;
    },
    addLanguageNavigation: function () {
        const navElement = document.querySelector('.navbar-nav');

        if (!navElement) {
            console.log('Navbar not found');
            return;
        }

        const languages = [
            { name: 'English', code: 'en', href: '#' },
            { name: 'Japanese', code: 'jp', href: '#' },
            { name: 'Spanish', code: 'es', href: '#' }
        ];

        const languageCodes = languages.map(language => language.code).join('|');
        const pattern = new RegExp(`\\/(?:${languageCodes})\\/`, 'i');

        const languageDropdown = this.createLanguageDropdown(languages, pattern);
        navElement.appendChild(languageDropdown);
    },
    addVersionNavigation: function () {

        const version = document.getElementById("toc");
        const selectHtml = `
        <select id="stride-current-version" class="form-select" aria-label="Default select example">
            <option selected>Latest</option>
        </select>
    `;
        version.insertAdjacentHTML("afterbegin", selectHtml);
    },
    loadVersions: function () {

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
                this.redirectToCurrentDocVersion();
            }).catch(error => {
                console.log('Error loading or processing versions.json:', error);
            });
    },
    redirectToCurrentDocVersion: function () {

        const selectElement = document.getElementById('stride-current-version');

        selectElement.addEventListener('change', () => {
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
                    console.log('Error checking URL:', error);
                })
                .finally(() => {
                    // Go to page
                    window.location.href = newAddress;
                });
        });
    },
    start: function () {

        // Call the function to start waiting for the navbar element
        this.waitForNavbarAndAddLanguageNavigation();

        this.addVersionNavigation();
        this.loadVersions();
    }
};

export default app;

// Start the app when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => app.start());