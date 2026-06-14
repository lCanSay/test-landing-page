const fs = require('fs');
let html = fs.readFileSync('../index.html', 'utf8');

const regex = /<div class="timeline__item(.*?)">\s*<div class="timeline__year">(.*?)<\/div>\s*<div class="timeline__dot"><\/div>\s*<div class="timeline__photo(.*?)>([\s\S]*?)<\/div>\s*<div class="timeline__content">\s*<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>\s*<\/div>\s*<\/div>/g;

let count = 0;
html = html.replace(regex, (match, itemClasses, year, photoClasses, photoInner, h3, p) => {
    count++;
    return `<div class="timeline__item${itemClasses}">
                    <div class="timeline__dot"></div>
                    <div class="timeline__photo${photoClasses}>${photoInner}</div>
                    <div class="timeline__text-wrapper">
                        <div class="timeline__year">${year}</div>
                        <div class="timeline__content">
                            <h3>${h3}</h3>
                            <p>${p}</p>
                        </div>
                    </div>
                </div>`;
});

console.log('Replaced', count, 'items');
fs.writeFileSync('../index.html', html);
