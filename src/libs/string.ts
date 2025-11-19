export function NumberAddComma(x: string | number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function IsNumber(str: any) {
  if (typeof str != 'string') return false; // we only process strings!
  return (
    !isNaN(parseInt(str)) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
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
