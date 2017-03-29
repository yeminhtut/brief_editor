(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['quill'], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(require('quill'))
  } else {
    root.Requester = factory(root.Quill,root.TableTrick)
  }
}(this, function (Quill) {
  'use strict'

  var app
  // declare ngQuill module
  app = angular.module('ngQuill', [])

  app.provider('ngQuillConfig', function () {
    var config = {
      modules: {
        toolbar: {
          container:[
              ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
              ['blockquote', 'code-block'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent

              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

              [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
              [{ 'align': [] }],
              ["emoji"],
              ['link', 'image', 'video']                         // link and image, video
          ],
          handlers: {'emoji': function() {}}
        },
          pasteHandler: true,
          linkImport: true,
          toolbar_emoji: true,
          short_name_emoji: true,
          imageImport: true,
          imageResize: {
            displaySize: true
          },
          mentions: {users: []}  
      },
      theme: 'snow',
      placeholder: 'Insert text here ...',
      readOnly: false,
      boundary: document.body
    }
    
    this.set = function (customConf) {
      customConf = customConf || {}

      if (customConf.modules) {
        config.modules = customConf.modules
      }
      if (customConf.theme) {
        config.theme = customConf.theme
      }
      if (customConf.placeholder) {
        config.placeholder = customConf.placeholder
      }
      if (customConf.boundary) {
        config.boundary = customConf.boundary
      }
      if (customConf.readOnly) {
        config.readOnly = customConf.readOnly
      }
      if (customConf.formats) {
        config.formats = customConf.formats
      }
    }

    this.$get = function () {
      return config
    }
  })

  app.component('ngQuillEditor', {
    bindings: {
      'modules': '<modules',
      'theme': '@?',
      'readOnly': '<?',
      'formats': '<?',
      'placeholder': '@?',
      'onEditorCreated': '&?',
      'onContentChanged': '&?',
      'onSelectionChanged': '&?',
      'ngModel': '<',
      'maxLength': '<',
      'minLength': '<',
    },
    require: {
      ngModelCtrl: 'ngModel'
    },
    transclude: {
      'toolbar': '?ngQuillToolbar'
    },
    template: '<div class="ng-hide quill-editor" ng-show="$ctrl.ready"><ng-transclude ng-transclude-slot="toolbar"></ng-transclude></div>',
    controller: ['$scope', '$element', '$timeout', '$transclude', 'ngQuillConfig','$attrs', function ($scope, $element, $timeout, $transclude, ngQuillConfig,$attrs) {
      var config = {},
          content,
          editorElem,
          modelChanged = false,
          editorChanged = false,
          editor;

      var isNotToolbar = $element[0].hasAttribute("no-tool-bar");
      this.validate = function (text) {
        if (this.maxLength) {
          if (text.length > this.maxLength + 1) {
            this.ngModelCtrl.$setValidity('maxlength', false)
          } else {
            this.ngModelCtrl.$setValidity('maxlength', true)
          }
        }

        if (this.minLength > 1) {
          // validate only if text.length > 1
          if (text.length <= this.minLength && text.length > 1) {
            this.ngModelCtrl.$setValidity('minlength', false)
          } else {
            this.ngModelCtrl.$setValidity('minlength', true)
          }
        }
      }

      this.$onChanges = function (changes) {
        if (changes.ngModel && changes.ngModel.currentValue !== changes.ngModel.previousValue) {
          content = changes.ngModel.currentValue;
          if (editor && !editorChanged) {
            modelChanged = true
            if (content) {
              let table_id = TableTrick.random_id();
              let row_id = TableTrick.random_id();      
              editor.clipboard.addMatcher('TABLE', function(node, delta) {
                table_id = TableTrick.random_id();
                return delta;
              });
              editor.clipboard.addMatcher('TR', function(node, delta) {
                row_id = TableTrick.random_id();
                return delta;
              });
              editor.clipboard.addMatcher('TD', function(node, delta) {
                let cell_id = TableTrick.random_id();
                return delta.compose(new Delta().retain(delta.length(), { td: table_id+'|'+row_id+'|'+cell_id }));
              });
              editor.clipboard.dangerouslyPasteHTML(content);
            } else {
              editor.setText('')
            }
          }
          editorChanged = false
        }

        if (editor && changes.readOnly) {
          editor.enable(!changes.readOnly.currentValue)
        }
      }

      this.$onInit = function () {
        config = {
          theme: this.theme || ngQuillConfig.theme,
          readOnly: this.readOnly || ngQuillConfig.readOnly,
          modules: this.modules || ngQuillConfig.modules,
          formats: this.formats || ngQuillConfig.formats,
          placeholder: this.placeholder || ngQuillConfig.placeholder,
          boundary: ngQuillConfig.boundary
        }
      }

      this.$postLink = function () {
        // create quill instance after dom is rendered
        $timeout(function () {
          this._initEditor(editorElem)
        }.bind(this), 0)
      }

      this._initEditor = function (editorElem) {
        var $editorElem = angular.element('<div></div>'),
          container = $element.children()
        editorElem = $editorElem[0];
       
        // set toolbar to custom one
        if ($transclude.isSlotFilled('toolbar')) {
          config.modules.toolbar = container.find('ng-quill-toolbar').children()[0]
        }

        if (isNotToolbar) {
          config.modules.toolbar = false;
        }

        container.append($editorElem);

        editor = new Quill(editorElem, config)

        this.ready = true;
        let modelData= this.ngModelCtrl.$viewValue;
        editorElem.children[0].innerHTML= '' 
        editor.clipboard.dangerouslyPasteHTML(modelData);

        // mark model as touched if editor lost focus
        editor.on('selection-change', function (range, oldRange, source) {
          let modelData= this.ngModelCtrl.$viewValue;
          // if (this.onSelectionChanged) {
          //   this.onSelectionChanged({
          //     editor: editor,
          //     oldRange: oldRange,
          //     range: range,
          //     source: source
          //   })
          // }

          if (range) {
            return
          }
          $scope.$applyAsync(function () {
            this.ngModelCtrl.$setTouched()
          }.bind(this))
        }.bind(this))

        // update model if text changes
        editor.on('text-change', function (delta, oldDelta, source) {
          var html = editorElem.children[0].innerHTML
          
          var text = editor.getText()
          console.log(html);
          if (html === '<p><br></p>') {
            html = null
          }
          this.validate(text)

          if (!modelChanged) {
            $scope.$applyAsync(function () {
              editorChanged = true

              this.ngModelCtrl.$setViewValue(html)

              if (this.onContentChanged) {

                // this.onContentChanged({
                //   editor: editor,
                //   html: html,
                //   text: text,
                //   delta: delta,
                //   oldDelta: oldDelta,
                //   source: source
                // })
              // if(dede){
              //   var test= $scope.$parent.briefVm.currentBrief.description;
              //   editorElem.children[0].innerHTML= '' 
              //   editor.clipboard.dangerouslyPasteHTML(0, test);
              // }
              }
            }.bind(this))
          }
          modelChanged = false
        }.bind(this))

        // set initial content
        if (content) {
          modelChanged = true;
          editor.clipboard.dangerouslyPasteHTML(content);
        }

        // provide event to get informed when editor is created -> pass editor object.
        if (this.onEditorCreated) {
          this.onEditorCreated({editor: editor})
        }
      }
    }]
  })
}))