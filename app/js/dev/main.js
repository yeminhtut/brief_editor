(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['quill', 'fuse', 'emoji'], factory)
    } else if (typeof exports === 'object') {
        module.exports = factory(require('quill', 'fuse', 'emoji'))
    } else {
        root.Requester = factory(root.Quill, root.Fuse)
    }
}(this, function(Quill, Fuse, Emoji) {
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

    EmojiBlot.blotName = "emoji";
    EmojiBlot.tagName = "SPAN";
    EmojiBlot.className = "emoji";


    Quill.register({
        'formats/emoji': EmojiBlot
    });
    Quill.register({
        'formats/mention': MentionBlot
    });
}));