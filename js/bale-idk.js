class BaleSDK {
    constructor() {
        this.webApp = null;
        this.isReady = false;
        this.userData = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const checkReady = () => {
                if (window.Bale && window.Bale.WebApp) {
                    this.webApp = window.Bale.WebApp;
                    this.isReady = true;
                    this.applyTheme();
                    this.userData = this.webApp.initDataUnsafe?.user || null;
                    this.webApp.ready();
                    this.setupEvents();
                    resolve(this.webApp);
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    applyTheme() {
        if (!this.webApp) return;
        const theme = this.webApp.themeParams;
        if (theme) {
            const root = document.documentElement;
            if (theme.bg_color) root.style.setProperty('--bg-color', theme.bg_color);
            if (theme.text_color) root.style.setProperty('--text-color', theme.text_color);
            if (theme.hint_color) root.style.setProperty('--hint-color', theme.hint_color);
            if (theme.link_color) root.style.setProperty('--link-color', theme.link_color);
            if (theme.button_color) root.style.setProperty('--button-color', theme.button_color);
            if (theme.button_text_color) root.style.setProperty('--button-text-color', theme.button_text_color);
            if (theme.secondary_bg_color) root.style.setProperty('--secondary-bg', theme.secondary_bg_color);
            if (theme.section_bg_color) root.style.setProperty('--section-bg', theme.section_bg_color);
            if (theme.section_separator_color) root.style.setProperty('--separator-color', theme.section_separator_color);
        }
    }

    setupEvents() {
        this.webApp.BackButton.onClick(() => {
            window.dispatchEvent(new CustomEvent('bale-back'));
        });
        this.webApp.onEvent('themeChanged', () => {
            this.applyTheme();
        });
    }

    getUser() {
        return this.userData;
    }

    expand() {
        if (this.webApp) this.webApp.expand();
    }

    close() {
        if (this.webApp) this.webApp.close();
    }

    enableBackButton() {
        if (this.webApp) this.webApp.BackButton.show();
    }

    disableBackButton() {
        if (this.webApp) this.webApp.BackButton.hide();
    }

    sendData(data) {
        if (this.webApp) {
            this.webApp.sendData(JSON.stringify(data));
        }
    }
}

const baleSDK = new BaleSDK();
