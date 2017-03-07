(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['quill', 'fuse','emoji'], factory)
    } else if (typeof exports === 'object') {
        module.exports = factory(require('quill', 'fuse','emoji'))
    } else {
        root.Requester = factory(root.Quill, root.Fuse)
    }
}(this, function(Quill, Fuse,Emoji) {
    'use strict';
    const Inline = Quill.import('blots/inline');

class EmojiBlot extends Inline {
        static create(unicode) {
            const node = super.create();
            node.dataset.unicode = unicode;
            return node;
        }
        static formats(node) {
            return node.dataset.unicode;
        }
        format(name, value) {
            if (name === "emoji" && value) {
                this.domNode.dataset.unicode = value;
            } else {
                super.format(name, value);
            }
        }

        formats() {
            const formats = super.formats();
            formats['emoji'] = EmojiBlot.formats(this.domNode);
            return formats;
        }
}

EmojiBlot.blotName = "emoji";
EmojiBlot.tagName = "SPAN";
EmojiBlot.className = "emoji";


Quill.register({
    'formats/emoji': EmojiBlot
});


const e = (tag, attrs, ...children) => {
    const elem = document.createElement(tag);
    Object.keys(attrs).forEach(key => elem[key] = attrs[key]);
    children.forEach(child => {
        if (typeof child === "string")
            child = document.createTextNode(child);
        elem.appendChild(child);
    });
    return elem;
};

class ShortNameEmoji {
    constructor(quill, props) {
        this.quill = quill;
        this.onClose = props.onClose;
        this.onOpen = props.onOpen;
        this.emojis = props.emojis;
        this.container = this.quill.container.parentNode.querySelector(props.container);
        this.container.style.position = "absolute";
        this.container.style.display = "none";

        this.onSelectionChange = this.maybeUnfocus.bind(this);
        this.onTextChange = this.update.bind(this);

        this.open = false;
        this.atIndex = null;
        this.focusedButton = null;

        quill.keyboard.addBinding({
            // TODO: Once Quill supports using event.key (#1091) use that instead of shift-2
            key: 186,  // 2
            shiftKey: true,
        }, this.onAtKey.bind(this));

        quill.keyboard.addBinding({
            key: 39,  // ArrowRight
            collapsed: true,
            format: ["emoji"]
        }, this.handleArrow.bind(this));

        quill.keyboard.addBinding({
            key: 40,  // ArrowRight
            collapsed: true,
            format: ["emoji"]
        }, this.handleArrow.bind(this));
        // TODO: Add keybindings for Enter (13) and Tab (9) directly on the quill editor
    }

    onAtKey(range, context) {
        if (this.open) return true;
        if (range.length > 0) {
            this.quill.deleteText(range.index, range.length, Quill.sources.USER);
        }
        this.quill.insertText(range.index, ":", "emoji", Quill.sources.USER);
        const atSignBounds = this.quill.getBounds(range.index);
        this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
        
        this.atIndex = range.index;
        this.container.style.left = atSignBounds.left + "px";
        this.container.style.top = atSignBounds.top + atSignBounds.height + 50 + "px",
        this.open = true;

        this.quill.on('text-change', this.onTextChange);
        this.quill.once('selection-change', this.onSelectionChange);
        this.update();
        this.onOpen && this.onOpen();
    }

    handleArrow() {
        if (!this.open) return true;
        this.buttons[0].focus();
    }

    update() {
        const sel = this.quill.getSelection().index;
        if (this.atIndex >= sel) { // Deleted the at character
            return this.close(null);
        }
        
        this.query = this.quill.getText(this.atIndex + 1, sel - this.atIndex - 1);
        
        // TODO: Should use fuse.js or similar fuzzy-matcher
        const emojis = this.emojis
              .filter(u => u.name.startsWith(this.query))
              .sort((u1, u2) => u1.name > u2.name);
        this.renderCompletions(emojis);
    }

    maybeUnfocus() {
      if (this.container.querySelector("*:focus")) return;
      this.close(null);
    }

    renderCompletions(emojis) {
        while (this.container.firstChild) this.container.removeChild(this.container.firstChild);
        const buttons = Array(emojis.length);
        this.buttons = buttons;
        const handler = (i, emoji) => event => {
            if (event.key === "ArrowRight" || event.keyCode === 39) {
                event.preventDefault();
                buttons[Math.min(buttons.length - 1, i + 1)].focus();
            } else if (event.key === "ArrowLeft" || event.keyCode === 37) {
                event.preventDefault();
                buttons[Math.max(0, i - 1)].focus();
            } 
            else if (event.key === "ArrowDown" || event.keyCode === 40) {
                event.preventDefault();
                buttons[Math.min(buttons.length - 1, i + 1)].focus();
            }
            else if (event.key === "Enter" || event.keyCode === 13
                       || event.key === " " || event.keyCode === 32
                       || event.key === "Tab" || event.keyCode === 9) {
                event.preventDefault();
                this.close(emoji);
            }
        };
        emojis.forEach((emoji, i) => {
            const li =  h('li', {},
                        h('button', {type: "button"},
                        h('span', {className: "ico"},this.convert(emoji.shortname)),
                        h('span', {className: "matched"}, ":" + this.query),
                        h('span', {className: "unmatched"}, emoji.name.slice(this.query.length))));
            this.container.appendChild(li);
            buttons[i] = li.firstChild;
            // Events will be GC-ed with button on each re-render:
            buttons[i].addEventListener('keydown', handler(i, emoji));
            buttons[i].addEventListener("mousedown", () => this.close(emoji));
            buttons[i].addEventListener("focus", () => this.focusedButton = i);
            buttons[i].addEventListener("unfocus", () => this.focusedButton = null);
        });
        this.container.style.display = "block";
    }

    close(value) {
        this.container.style.display = "none";
        while (this.container.firstChild) this.container.removeChild(this.container.firstChild);
        this.quill.off('selection-change', this.onSelectionChange);
        this.quill.off('text-change', this.onTextChange);
        if (value) {
            const {name, unicode, shortname} = value;
            let emoji_icon = this.convert(shortname);
            this.quill.deleteText(this.atIndex, this.query.length + 1, Quill.sources.USER);
            this.quill.insertText(this.atIndex, emoji_icon, "emoji", unicode, Quill.sources.USER);
            this.quill.insertText(this.atIndex + emoji_icon.length + 1, " ", 'emoji', false, Quill.sources.USER);
            this.quill.setSelection(this.atIndex + emoji_icon.length + 1, 0, Quill.sources.SILENT);
        }
        this.quill.focus();
        this.open = false;
        this.onClose && this.onClose(value);
    }

    convert(input){
            var emoji = new EmojiConvertor();

            // replaces \u{1F604} with platform appropriate content
            var output1 = emoji.replace_unified(input);

            // replaces :smile: with platform appropriate content
            var output2 = emoji.replace_colons(input);

            // force text output mode
            emoji.text_mode = true;

            // show the short-name as a `title` attribute for css/img emoji
            emoji.include_title = true;

            // change the path to your emoji images (requires trailing slash)
            // you can grab the images from the emoji-data link here:
            // https://github.com/iamcal/js-emoji/tree/master/build
            emoji.img_sets.apple.path = 'http://my-cdn.com/emoji-apple-64/';
            emoji.img_sets.apple.sheet = 'http://my-cdn.com/emoji-apple-sheet-64.png';

            // Configure this library to use the sheets defined in `img_sets` (see above)
            emoji.use_sheet = true;

            // add some aliases of your own - you can override builtins too
            emoji.addAliases({
              'doge' : '1f415',
              'cat'  : '1f346'
            });

            // remove your custom aliases - this will reset builtins
            emoji.removeAliases([
              'doge',
              'cat',
            ]);

            return output2;

        }

}


Quill.register('modules/short_name_emoji', ShortNameEmoji);
}))