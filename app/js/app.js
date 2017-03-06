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
	            {id: 1, name: 'Christy'},
	            {id: 2, name: 'Micha'},
	            {id: 3, name: 'Sima'},
	            {id: 4, name: 'Coreen'},
	            {id: 5, name: 'Aimee'},
	            {id: 6, name: 'Brant'},
	            {id: 7, name: 'Maryetta'},
	            {id: 8, name: 'Nicol'},
	          ]
	        }
	    }
	  });
	}]);