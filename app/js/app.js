var app = angular.module("myApp",['ngQuill','ngSanitize']);

app.controller('mainController',
	function mainController($scope){
		$scope.content = '';
		//$scope.content = '<table table_id="3nn6wonfc23"><tr row_id="teyau52h46a"><td table_id="3nn6wonfc23" row_id="teyau52h46a" cell_id="cgzb46v9r18"><p><span style="color: rgb(0, 0, 0); background-color: transparent;">1</span></p></td><td table_id="3nn6wonfc23" row_id="teyau52h46a" cell_id="m8hrttervv7"><p><span style="color: rgb(0, 0, 0); background-color: transparent;">2</span></p></td><td table_id="3nn6wonfc23" row_id="teyau52h46a" cell_id="6suyqffq2q6"><p><span style="color: rgb(0, 0, 0); background-color: transparent;">3</span></p></td></tr><tr row_id="lxz2cfs85tp"><td table_id="3nn6wonfc23" row_id="lxz2cfs85tp" cell_id="4yxztl404nf"><p><span style="color: rgb(0, 0, 0); background-color: transparent;">4</span></p></td><td table_id="3nn6wonfc23" row_id="lxz2cfs85tp" cell_id="mt9wi5pdbtl"><p><span style="color: rgb(0, 0, 0); background-color: transparent;">5</span></p></td><td table_id="3nn6wonfc23" row_id="lxz2cfs85tp" cell_id="37y602u3kjw"><p><span style="color: rgb(0, 0, 0); background-color: transparent;">6</span></p><p><br></p><p><br></p></td></tr></table>';
		$scope.comment = '';
		$scope.userList =  {
	              	users: [
	                  {label:'Joe', username: 'Joe'},
	                  {label:'Mike', username: 'Mike'},
	                  {label:'Diane', username: 'Diane'}
	              	]
	            }
	}
);

app.config(['ngQuillConfigProvider', function (ngQuillConfigProvider) {
	// var toolbarOptions = {
 //            container: [
 //                      ['bold', 'italic', 'underline', 'strike','emoji'],
 //                    ],
 //                    handlers: {'emoji': function() {}}
 //  	};
	// ngQuillConfigProvider.set({ 
	// 	modules: {
	//         toolbar: toolbarOptions,
	//         toolbar_emoji: true,
 //          	short_name_emoji: true,
 //    	},
	// 	placeholder: 'Compose an epic...',
 //    	theme: 'snow',
	// });
    
}]);
