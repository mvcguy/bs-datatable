class SessionStorageService {
    constructor() {
        console.log('Session storage is initialized');
    }

    addItem(key, value, expiry) {
        //
        // Here we are using sessionStorage instead of localStorage.
        // The later is not cleared even if the user closes the browser!
        //

        var x = { value: value, type: 'prem', expiry: expiry.getTime() };

        if (typeof value === 'object' && value !== undefined) {
            x.type = 'object';
        }

        sessionStorage.setItem(key, JSON.stringify(x));
    }

    appendItem(key, appendFactory) {
        try {
            var item = this.getItemRaw(key);
            if (item) {
                var newValue = appendFactory(item.value);
                this.addItem(key, newValue, new Date(item.expiry));
            }
        } catch (error) {
            console.error(error);
        }
    }

    createExpiryKey(key) {
        return key + '-expiry';
    }

    getItemRaw(key) {
        var entry = sessionStorage.getItem(key);
        if (entry) {

            var x = JSON.parse(entry);

            var expiry = x.expiry;
            if (Date.now() > parseInt(expiry)) {
                this.removeItem(key);
                console.log('entry expired, will be removed', x);
                return undefined;
            }

            return x;
        }
        return null;
    }

    getItem(key) {
        var entry = sessionStorage.getItem(key);
        if (entry) {

            var x = JSON.parse(entry);

            var expiry = x.expiry;
            if (Date.now() > parseInt(expiry)) {
                this.removeItem(key);
                return undefined;
            }

            return x.value;
        }
        return null;
    }

    removeItem(key) {
        sessionStorage.removeItem(key)
    }

    /**
     * Removes all the items starting with the given prefix from session storage 
     * Note that if no prefix is provided, it will remove all the keys.
     * @param {string?} prefix optional
     * @returns 
     */
    removeAll(prefix) {

        if (!prefix) {
            sessionStorage.removeAll();
            return;
        }


        var length = sessionStorage.length;
        if (length <= 0) return;


        var keys: string[] = [];

        for (let index = 0; index < length; index++) {
            var key = sessionStorage.key(index);
            if (!key.startsWith(prefix)) continue;

            keys.push(key);
        }

        for (let index = 0; index < keys.length; index++) {
            var key = keys[index];
            sessionStorage.removeItem(key);
        }
    }
}

export {SessionStorageService}