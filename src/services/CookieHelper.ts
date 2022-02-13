
/**
 * simple utility to add/remove cookies based on ES7
 * credit: https://stackoverflow.com/a/48706852
 */
class Cookie {
    get(name: string) {
        let c = document.cookie.match(`(?:(?:^|.*; *)${name} *= *([^;]*).*$)|^.*$`)[1]
        if (c) return decodeURIComponent(c)
    }

    set(name: string, value: any, opts: any = {}) {
        /*If options contains days then we're configuring max-age*/
        if (opts.days) {
            opts['max-age'] = opts.days * 60 * 60 * 24;

            /*Deleting days from options to pass remaining opts to cookie settings*/
            delete opts.days
        }

        /*Configuring options to cookie standard by reducing each property*/
        opts = Object.entries(opts).reduce(
            (accumulatedStr, [k, v]) => `${accumulatedStr}; ${k}=${v}`, ''
        )

        /*Finally, creating the key*/
        document.cookie = name + '=' + encodeURIComponent(value) + opts
    }

    delete(name: string, opts?: any) {
        this.set(name, '', { 'max-age': -1, ...opts })
    }

    // path & domain must match cookie being deleted 
    getJSON(name: string) {
        var result = this.get(name);
        if (!result) return '';
        return JSON.parse(result);
    }

    setJSON(name: string, value: any, opts: any) {
        this.set(name, JSON.stringify(value), opts)
    }
}

export const CookieHelper = new Cookie();