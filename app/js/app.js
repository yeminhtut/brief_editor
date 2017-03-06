var app = angular.module("myApp",['ngQuill','ngSanitize']);

app.controller('mainController',
	function mainController($scope){
		$scope.content = '';
		$scope.comment = '';
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
	ngQuillConfigProvider.set({ 
		placeholder: 'Compose an epic...' ,
	    modules: {
	        toolbar: toolbarOptions,
	        emoji: true,
	        mentions: {
	          container: '.completions',
	          users: [
	            {label:'Joe', username: 'Joe'},
            	{label:'Mike', username: 'Mike'},
            	{label:'Diane', username: 'Diane'}
	          ]
	        }
	    }
	  });
	}]);