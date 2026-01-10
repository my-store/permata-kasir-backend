export function NumberAddComma(x: string | number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function generateId(length: number): string {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

export function IsNumber(str: string): boolean {
    return Number.isFinite(+str);
}

export function getTimestamp(): string {
    return new Date().toISOString();
}

export function ParseUrlQuery(oldQuery: any): any {
    let newQuery: any = {};

    for (let key in oldQuery) {
        // Solid query (default)
        // Example: /?name=Izzat Alharis
        let val: any = oldQuery[key];

        // Value is JSON string
        // Example: /?age={"gt": 30}
        try {
            // Trying to parse it ...
            val = JSON.parse(val);
        } catch {}

        newQuery[key] = val;
    }

    return newQuery;
}
