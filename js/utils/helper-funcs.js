/**
 * @method
 * @name getHTMLElementPosition
 * @param{HTMLElement} element
 * @return{Object}
 * @description compute the absolute position of an HTML element
 */
export function getHTMLElementPosition(element) {
    let xPos = 0, yPos = 0;

    while(element) {
        if (element.tagName === 'BODY') {
            const xScroll = element.scrollLeft || document.documentElement.scrollLeft;
            const yScroll = element.scrollTop || document.documentElement.scrollTop;

            xPos += element.offsetLeft - xScroll + element.clientLeft;
            yPos += element.offsetTop - yScroll + element.clientTop;
        }
        else {
            xPos += element.offsetLeft - element.scrollLeft + element.clientLeft;
            yPos += element.offsetTop - element.scrollTop + element.clientTop;
        }
        element = element.offsetParent;
    }

    return {
        x: xPos,
        y: yPos
    };
}

/**
 * @method
 * @name handleHTTPErrors
 * @param{HTTPResponse} response
 * @return{HTTPResponse}
 * @throws Error
 */
export function handleHTTPErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

/**
 * @method
 * @name getBaseUrl
 * @return{String} Domain base-url
 */
export function getBaseUrl() {
    if (typeof window !== 'undefined') {
        return `${window.location.protocol}/${window.location.host}`;
    }
}

/**
 * @method
 * @name
 * @description serializes an object into a query string
 * @param{Object} obj - the object to serialize
 * @return{string} the encoded query string
 */
export function serialize(obj, prefix) {
    const str = [];
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            const key = prefix ? `${prefix}[${prop}]` : prop, val = obj[prop];
            str.push((val !== null && typeof val === 'object') ?
             serialize(val, key) :
             `${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
        }
    }
    return str.join('&');
}

/**
 * @method
 * @name polygon
 * @description draws a regular polygon on a HTML5 canvas
 * @param{CanvasRenderingContext2D} context
 * @param{Number} x - horizontal coordinate from left
 * @param{Number} y - vertical coordinate from top
 * @param{Integer} sides - number of sides: default to 3
 * @param{Number} startAngle - default to 0
 * @param{boolean} anticlockwise - default to false
 */
export function polygon(ctx, x, y, radius, sides = 3, startAngle = 0, anticlockwise = false) {
    if (sides < 3) return;
    let a = (Math.PI * 2)/sides;
    a = anticlockwise ? -a : a;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(startAngle);
    ctx.moveTo(radius,0);
    for (let i = 1; i < sides; i++) {
        ctx.lineTo(radius * Math.cos(a*i), radius * Math.sin(a*i));
    }
    ctx.closePath();
    ctx.restore();
}

/**
 * @method
 * @name isElementInViewport
 * @param{HTMLElement} el
 * @return{boolean} 
 * @description returns true if element is in viewport
 */
export function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
