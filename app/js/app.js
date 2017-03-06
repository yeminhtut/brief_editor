var app = angular.module("myApp",['ngQuill']);

app.controller('mainController',
	function mainController($scope){
		$scope.title = '';
	}
);

app.config(['ngQuillConfigProvider', function (ngQuillConfigProvider) {
	toolbarOptions = {
            container: [
                ["bold", "italic", "underline", "blockquote", "code-block"],
                [{"header": 1}],
                [{"list": "ordered"}, {"list": "bullet"}],
                [{"color": []}, {"background": []}],
                ["emoji"]
            ],
            handlers: {
                'emoji': function() {}
            }
    }
	ngQuillConfigProvider.set({ placeholder: false ,
	    modules: {
	        toolbar: toolbarOptions,
	        emoji: true,
	    }
	  });
	}]);