const fs = require('fs');
let css = fs.readFileSync('../css/style.css', 'utf8');

// Replace .timeline__item and its nth-child rules
css = css.replace(/\.timeline__item \{[\s\S]*?\}\s*\.timeline__item:nth-child\(odd\) \{[\s\S]*?\}\s*\.timeline__item:nth-child\(even\) \{[\s\S]*?\}/, 
\.timeline__item {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 64px;
}

.timeline__item:nth-child(odd) {
    flex-direction: row-reverse;
}

.timeline__item:nth-child(even) {
    flex-direction: row;
}\);

// Replace .timeline__dot and hover state, and its odd/even rules
css = css.replace(/\.timeline__dot \{[\s\S]*?\}\s*\.timeline__item:hover \.timeline__dot \{[\s\S]*?\}\s*\.timeline__item:nth-child\(odd\) \.timeline__dot \{[\s\S]*?\}\s*\.timeline__item:nth-child\(even\) \.timeline__dot \{[\s\S]*?\}/,
\.timeline__dot {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 18px;
    height: 18px;
    background: var(--color-accent);
    border: 4px solid var(--color-bg);
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--color-accent);
    transition: all 0.3s ease;
    z-index: 2;
}

.timeline__item:hover .timeline__dot {
    transform: translate(-50%, -50%) scale(1.3);
    box-shadow: 0 0 0 4px rgba(227, 6, 19, 0.2);
    background: var(--color-white);
}\);

// Replace .timeline__photo and its odd/even translations
css = css.replace(/\.timeline__photo \{[\s\S]*?\}\s*\.timeline__photo img \{[\s\S]*?\}\s*\.timeline__item:hover \.timeline__photo img \{[\s\S]*?\}\s*\.timeline__photo--logo \{[\s\S]*?\}\s*\.timeline__photo--logo img \{[\s\S]*?\}\s*\.timeline__item:nth-child\(odd\) \.timeline__photo \{[\s\S]*?\}\s*\.timeline__item:nth-child\(even\) \.timeline__photo \{[\s\S]*?\}/,
\.timeline__photo,
.timeline__text-wrapper {
    width: calc(50% - 48px);
}

.timeline__photo {
    position: relative;
    aspect-ratio: 16/9;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    flex-shrink: 0;
}

.timeline__photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
}

.timeline__item:hover .timeline__photo img {
    transform: scale(1.05);
}

.timeline__photo--logo {
    background: #ffffff;
}

.timeline__photo--logo img {
    object-fit: contain !important;
    padding: 15%;
}

.timeline__text-wrapper {
    display: flex;
    flex-direction: column;
}

.timeline__item:nth-child(odd) .timeline__text-wrapper {
    text-align: right;
    align-items: flex-end;
}

.timeline__item:nth-child(even) .timeline__text-wrapper {
    text-align: left;
    align-items: flex-start;
}\);

// Add mobile media query fix for flexbox
css = css.replace(/(\.timeline__item \{\s*width: 100%;\s*margin-left: 0 !important;\s*text-align: left !important;\s*padding: 32px 24px;\s*min-height: auto;\s*\})/, 
\\
    .timeline__item {
        flex-direction: column !important;
        align-items: flex-start !important;
        padding-left: 24px !important;
        padding-right: 24px !important;
        margin-bottom: 32px !important;
    }
    .timeline__photo, .timeline__text-wrapper {
        width: 100% !important;
    }
    .timeline__text-wrapper {
        text-align: left !important;
        align-items: flex-start !important;
    }\);

fs.writeFileSync('../css/style.css', css);
console.log('CSS updated');
