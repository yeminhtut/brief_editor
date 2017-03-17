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
                      ['bold', 'italic', 'underline', 'strike'],
                      ['emoji']       
                    ],
                    handlers: {'emoji': function() {}}
  };
	ngQuillConfigProvider.set({ 
		placeholder: 'Compose an epic...' ,
	    modules: {
          //toolbar: toolbarOptions,
	        //toolbar_emoji: true,
	        //short_name_emoji: true,
          imageImport: true,
          imageResize: { displaySize: true},
          mentions: {
	              	users: [
	                  {label:'Joe', username: 'Joe'},
	                  {label:'Mike', username: 'Mike'},
	                  {label:'Diane', username: 'Diane'}
	              	]
	            } 
	    }
	  });
}]);
