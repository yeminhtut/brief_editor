var toolbarOptions = {
    container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{
            'header': 1
        }, {
            'header': 2
        }],
        [{
            'list': 'ordered'
        }, {
            'list': 'bullet'
        }],
        [{
            'script': 'sub'
        }, {
            'script': 'super'
        }],
        [{
            'indent': '-1'
        }, {
            'indent': '+1'
        }],
        [{
            'direction': 'rtl'
        }],
        [{
            'header': [1, 2, 3, 4, 5, 6, false]
        }],
        [{
            'color': []
        }, {
            'background': []
        }],
        [{
            'font': []
        }],
        [{
            'align': []
        }],
        ['clean'],
        ['emoji'],
        ['link', 'image', 'video']
    ],
    handlers: {
        'emoji': function() {}
    }
}
var quill = new Quill('#editor', {
    modules: {
        toolbar: toolbarOptions,
        pasteHandler: true,
        toolbar_emoji: true,
        short_name_emoji: true,
        imageDrop: true,
        // imageResize: {
        //     displaySize: true
        // },
        mentions: {
            users: [{
                    label: 'Joe',
                    username: 'Joe'
                },
                {
                    label: 'Mike',
                    username: 'Mike'
                },
                {
                    label: 'Diane',
                    username: 'Diane'
                }
            ]
        }
    },
    placeholder: 'Compose an epic...',
    theme: 'snow',
});