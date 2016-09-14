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
