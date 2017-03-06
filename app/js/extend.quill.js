const Inline = Quill.import('blots/inline');

class MentionBlot extends Inline {
    static create(label) {
        const node = super.create();
        node.dataset.label = label;
        return node;
    }
    static formats(node) {
        return node.dataset.label;
    }
    format(name, value) {
        if (name === "mention" && value) {
            this.domNode.dataset.label = value;
        } else {
            super.format(name, value);
        }
    }
    
    formats() {
        const formats = super.formats();
        formats['mention'] = MentionBlot.formats(this.domNode);
        return formats;
    }
}

MentionBlot.blotName = "mention";
MentionBlot.tagName = "SPAN";
MentionBlot.className = "mention";


Quill.register({
    'formats/mention': MentionBlot
});


const h = (tag, attrs, ...children) => {
    const elem = document.createElement(tag);
    Object.keys(attrs).forEach(key => elem[key] = attrs[key]);
    children.forEach(child => {
        if (typeof child === "string")
            child = document.createTextNode(child);
        elem.appendChild(child);
    });
    return elem;
};

class Mentions {
    constructor(quill, props) {
        this.quill = quill;
        this.onClose = props.onClose;
        this.onOpen = props.onOpen;
        this.users = props.users;
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
            key: 50,  // 2
            shiftKey: true,
        }, this.onAtKey.bind(this));

        quill.keyboard.addBinding({
            key: 40,  // ArrowDown
            collapsed: true,
            format: ["mention"]
        }, this.handleArrow.bind(this));
        // TODO: Add keybindings for Enter (13) and Tab (9) directly on the quill editor
    }

    onAtKey(range, context) {
        if (this.open) return true;
        if (range.length > 0) {
            this.quill.deleteText(range.index, range.length, Quill.sources.USER);
        }
        this.quill.insertText(range.index, "@", "mention", "0", Quill.sources.USER);
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
        const users = this.users
              .filter(u => u.username.startsWith(this.query))
              .sort((u1, u2) => u1.username > u2.username);
        this.renderCompletions(users);
    }

    maybeUnfocus() {
      if (this.container.querySelector("*:focus")) return;
      this.close(null);
    }

    renderCompletions(users) {
        while (this.container.firstChild) this.container.removeChild(this.container.firstChild);
        const buttons = Array(users.length);
        this.buttons = buttons;
        const handler = (i, user) => event => {
            if (event.key === "ArrowDown" || event.keyCode === 40) {
                event.preventDefault();
                buttons[Math.min(buttons.length - 1, i + 1)].focus();
            } else if (event.key === "ArrowUp" || event.keyCode === 38) {
                event.preventDefault();
                buttons[Math.max(0, i - 1)].focus();
            } else if (event.key === "Enter" || event.keyCode === 13
                       || event.key === " " || event.keyCode === 32
                       || event.key === "Tab" || event.keyCode === 9) {
                event.preventDefault();
                this.close(user);
            }
        };
        users.forEach((user, i) => {
            const li = h('li', {},
                         h('button', {type: "button"},
                           h('span', {className: "matched"}, "@" + this.query),
                           h('span', {className: "unmatched"}, user.username.slice(this.query.length))));
            this.container.appendChild(li);
            buttons[i] = li.firstChild;
            // Events will be GC-ed with button on each re-render:
            buttons[i].addEventListener('keydown', handler(i, user));
            buttons[i].addEventListener("mousedown", () => this.close(user));
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
            const {label, username} = value;
            this.quill.deleteText(this.atIndex, this.query.length + 1, Quill.sources.USER);
            this.quill.insertText(this.atIndex, "@" + username, "mention", label, Quill.sources.USER);
            this.quill.insertText(this.atIndex + username.length + 1, " ", 'mention', false, Quill.sources.USER);
            this.quill.setSelection(this.atIndex + username.length + 2, 0, Quill.sources.SILENT);
        }
        this.quill.focus();
        this.open = false;
        this.onClose && this.onClose(value);
    }

}


Quill.register('modules/mentions', Mentions);


Quill.register('modules/emoji', function(quill, options) {
    var toolbar = quill.getModule('toolbar');
    var isToolbar = toolbar !== undefined;
    
    if (isToolbar) {
        toolbar.addHandler('emoji', checkPalatteExist);
    };
    

    function checkPalatteExist(){
        var elementExists = document.getElementById("emoji-palette");
        if (elementExists) {
            return elementExists.remove();
        }
        let range = quill.getSelection();
        showEmojiPalatte(range);
    }

    function showEmojiPalatte() {
        toolbar_emoji_element = document.querySelector('.ql-emoji');
        let range = quill.getSelection();
        const atSignBounds = quill.getBounds(range.index);
        emoji_palatte_container = document.createElement('div');
        toolbar_container = document.querySelector('.ql-toolbar');
        offsetHeight = toolbar_container.offsetHeight;
        toolbar_container.appendChild(emoji_palatte_container);
        emoji_palatte_container.id = 'emoji-palette';
        emoji_palatte_container.style.top= atSignBounds.top + 40 + offsetHeight / 2; 
        emoji_palatte_container.style.left= atSignBounds.left;

        emojiCollection = emojiOne;
        showEmojiList(emojiCollection);

        function showEmojiList(emojiCollection){
        	emojiCollection.map(function(emoji) {
                let span = document.createElement('span');
                let t = document.createTextNode(emoji.shortname);
                span.appendChild(t);
                span.classList.add('bem');
                span.classList.add('bem-'+emoji.name);
                let output = convert(emoji.shortname);
                span.innerHTML = output+' ';
                emoji_palatte_container.appendChild(span);
                
	        	var customButton = document.querySelector('.bem-' + emoji.name);
		        if (customButton) {
	                customButton.addEventListener('click', function() {
                        if (range) {
                           quill.insertText(range.index, customButton.innerHTML);
                           quill.setSelection(range.index+4, 0);
                           range.index = range.index+4;
                           checkPalatteExist();
                        }
	                });
		        };
	        });
        }
    }

    function convert(input){
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
});




