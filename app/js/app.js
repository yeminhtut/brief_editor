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
	        short_name_emoji: true,
	        short_name_emoji: {
	          	container: '.emoji_completions',
				emojis: [
					{name: 'grinning', unicode: '1f600',shortname:":grinning:"}, 
				    {name: 'grimacing', unicode: '1f62c',shortname:":grimacing:"}, 
				    {name: 'smile', unicode: '1f604',shortname:":smile:"}, 
				    {name: 'joy', unicode: '1f602',shortname:":joy:"}, 
				    {name: 'smiley', unicode: '1f603',shortname:":smiley:"}, 
				    {name: 'laughing', unicode: '1f606',shortname:":laughing:"}, 
				    {name: 'innocent', unicode: '1f607',shortname:":innocent:"}, 
				    {name: 'wink', unicode: '1f609',shortname:":wink:"}, 
				    {name: 'disappointed', unicode: '1f61e',shortname:":disappointed:"}, 
				    {name: 'worried', unicode: '1f61f',shortname:":worried:"}, 
				    {name: 'angry', unicode: '1f620',shortname:":angry:"}, 
				    {name: 'confused', unicode: '1f615',shortname:":confused:"}, 
				    {name: 'tired_face', unicode: '1f62b',shortname:":tired_face:"}, 
				    {name: 'scream', unicode: '1f631',shortname:":scream:"}, 
				]
	        },
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