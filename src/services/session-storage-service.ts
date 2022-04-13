import { CachedItem, ISessionStorageService } from "../commonTypes/common-types";

class SessionStorageService implements ISessionStorageService {
    constructor() {
        // console.log('Session storage is initialized');
    }

    addItem(key: string, value: any, expiry: Date) {
        //
        // Here we are using sessionStorage instead of localStorage.
        // The later is not cleared even if the user closes the browser!
        //

        var item: CachedItem = { value: value, type: 'prem', expiry: expiry.getTime() };

        if (typeof value === 'object' && value !== undefined) {
            item.type = 'object';
        }

        sessionStorage.setItem(key, JSON.stringify(item));
    }

    appendItem(key: string, appendFactory: (value: any) => any) {
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

    createExpiryKey(key: string): string {
        return key + '-expiry';
    }

    getItemRaw(key: string): CachedItem {
        var entry = sessionStorage.getItem(key);
        if (entry) {

            var item: CachedItem = JSON.parse(entry);

            if (Date.now() > item.expiry) {
                this.removeItem(key);
                console.log('entry expired, will be removed', item);
                return undefined;
            }

            return item;
        }
        return null;
    }

    getItem(key: string): any {
        var item = this.getItemRaw(key);
        if (item)
            return item.value;

        return null;
    }

    removeItem(key: string) {
        sessionStorage.removeItem(key)
    }

    /**
     * Removes all the items starting with the given prefix from session storage 
     * Note that if no prefix is provided, it will remove all the keys.
     * @param {string?} prefix optional
     * @returns 
     */
    removeAll(prefix: string) {

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

export { SessionStorageService }