// remove query string
const trimThumb = (url) => {
    if (url)
        return url.split(/[?#]/)[0];
    else
        return '';
}

exports.trimThumb = trimThumb;