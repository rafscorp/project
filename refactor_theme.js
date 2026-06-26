const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directoryPath);

let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Backgrounds
    content = content.replace(/\bbg-zinc-950\b/g, 'bg-background');
    content = content.replace(/\bbg-zinc-900\b/g, 'bg-panel');
    content = content.replace(/\bbg-zinc-950\/50\b/g, 'bg-background/50');
    content = content.replace(/\bbg-zinc-900\/50\b/g, 'bg-panel/50');
    content = content.replace(/\bbg-zinc-900\/40\b/g, 'bg-panel/40');
    content = content.replace(/\bbg-zinc-900\/60\b/g, 'bg-panel/60');
    content = content.replace(/\bbg-zinc-900\/80\b/g, 'bg-panel/80');
    content = content.replace(/\bbg-zinc-900\/90\b/g, 'bg-panel/90');
    
    // Muted text
    content = content.replace(/\btext-zinc-400\b/g, 'text-muted-foreground');
    content = content.replace(/\btext-zinc-300\b/g, 'text-foreground\/80');
    content = content.replace(/\btext-zinc-500\b/g, 'text-muted-foreground');

    // Borders
    content = content.replace(/\bborder-white\/5\b/g, 'border-border-subtle');
    content = content.replace(/\bborder-white\/10\b/g, 'border-border-subtle');
    content = content.replace(/\bborder-zinc-800\b/g, 'border-border-subtle');
    
    // Divide
    content = content.replace(/\bdivide-white\/5\b/g, 'divide-border-subtle');
    content = content.replace(/\bdivide-white\/10\b/g, 'divide-border-subtle');
    content = content.replace(/\bdivide-zinc-800\b/g, 'divide-border-subtle');

    // Replace text-white cautiously. 
    // If the class string contains bg-violet, bg-emerald, bg-blue, bg-amber, bg-red, bg-zinc-800, etc., DO NOT replace text-white.
    // We will do this by matching the whole className string, and checking if it contains dangerous background colors.
    content = content.replace(/className=(["'{`])(.*?)\1/g, (match, quote, classes) => {
        if (classes.includes('text-white')) {
            const hasColorfulBg = /\bbg-(violet|emerald|blue|amber|red|green|yellow|zinc-800|black)-/.test(classes) || classes.includes('bg-violet') || classes.includes('bg-emerald') || classes.includes('bg-blue');
            const isButtonLike = classes.includes('btn-shimmer') || classes.includes('bg-zinc-800') || classes.includes('bg-black');
            
            if (!hasColorfulBg && !isButtonLike) {
                // Replace text-white with text-foreground in this specific class string
                classes = classes.replace(/\btext-white\b/g, 'text-foreground');
            }
        }
        return `className=${quote}${classes}${quote}`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
    }
});

console.log(`Refactored ${changedFiles} files successfully.`);
