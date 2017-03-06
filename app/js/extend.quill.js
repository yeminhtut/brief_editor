Quill.register('modules/emoji', function(quill, options) {
    var toolbar = quill.getModule('toolbar');
    toolbar.addHandler('emoji', checkPalatteExist);

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
        toolbar_container.appendChild(emoji_palatte_container);
        emoji_palatte_container.id = 'emoji-palette';
        emoji_palatte_container.style.top= atSignBounds.top + 60; 
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

Quill.register('modules/typing', function(quill, options) {
    quill.on('text-change', function(delta, oldDelta, source) {
        console.log(quill.getText());
        if (source == 'user') {
            document.getElementById("typing").innerHTML = quill.getText();
        }
    });
});


