(function(){
'use strict'
//declare app 
let dv4app = angular.module('NarrowItDown',[
    //dependencies
]);

//----------------------------------
//declare URL contstant 
dv4app
    .constant('menuServiceURL','https://davids-restaurant.herokuapp.com/menu_items.json')

//------------------------------------------
//declaire main controller
dv4app
    .controller('NarrowItDownCtrl',[
        //dependencies
        '$scope','$q','MenuSearchService',
        //main function
        narrowItDown
    ]);
//main controller function 
function narrowItDown(scope,$q,searchService){
    let ctrl = this;

    //init searchTerm 
    ctrl.searchTerm="";
    //define empty array
    ctrl.showCount=false; 
    //ctrl.found=[];
    //get items 
    ctrl.getMatchedMenuItems = function(){
        console.log("Fetch items...");
        if (ctrl.searchTerm==""){
            //return empty array 
            ctrl.found=[];
        }else{
            //async
            searchService.getMatchedMenuItems(ctrl.searchTerm)
            .then((data)=>{
                //load result
                ctrl.found = data; 
            }).catch((err)=>{
                //empty array 
                ctrl.found=[];
                //log error 
                console.error(err);
            });
        }
        //show count
        ctrl.showCount=true;
    };

    //remove item
    //id is passed from directive
    ctrl.removeItem = function(itemId){

        if (ctrl.found.length>0){
            //remove item 
            ctrl.found.splice(itemId,1)
            //log 
            console.log("Removed item...", itemId);
        }
    }
}

//--------------------------------------
//declare service
dv4app
    .service('MenuSearchService',[
        //dependencies
        '$http','$q','menuServiceURL',
        menuSearchService
    ]);
//main search function 
function menuSearchService($http,$q,menuServiceURL){
    let serv = this;

    //test items
    /* 
    serv.allItems=[
        {short_name:'A',name:"long name 1", description:'This is menu descriptions'},
        {short_name:'B',name:"short name 2", description:'This is menu descriptions'}
    ]*/

    //fetch data from API
    serv.getMatchedMenuItems=function(searchTerm){
        let filtered=[],
            q = $q.defer(); 
        //check cache
        if (serv.allItems){            
            filtered = filterItems(searchTerm);
            //return filtered;
            q.resolve(filtered);
        }else{
            //perform http request
            $http({
                method:"GET",
                url: menuServiceURL
            }).then((resp)=>{
                //load data into service holder
                serv.allItems = resp.data.menu_items;
                //filter it 
                filtered = filterItems(searchTerm);
                //RETURN VALUE
                //return filtered;
                q.resolve(filtered);
            }).catch((err)=>{
                //error here
                console.error(err);
                //return empty array
                //return [];
                q.reject(err);
            });
        }; 
        //RETURN PROMISE
        return q.promise;       
    };

    function filterItems(searchTerm){
        let filtered=[];
        console.log("Search for items with...", searchTerm)

        filtered = serv.allItems.filter((item)=>{
            return item.description.indexOf(searchTerm.toLowerCase()) > -1;
        });

        return filtered;
    };
};

//----------------------------------------
//declare directives 
dv4app
    .directive('foundItems',[
        //dependencies
        //main function
        foundItems
    ]);

function foundItems(){
    let dir = {
        scope:{
            menuItems:'<',
            onRemove:'&'
        },
        template:` 
            <table class="table table-striped">
                <tr data-ng-repeat="item in ctrl.menuItems">
                    <td>{{item.short_name}}</td>
                    <td>{{item.name}}</td>
                    <td>{{item.description}}</td>
                    <td style="text-align:right;"> 
                        <button 
                            data-ng-click="ctrl.removeItem($index)"
                            class="btn"
                            title="Don't want thisone"
                        ><i class="glyphicon glyphicon-remove"></i></button>
                    </td> 
                </tr>
            </table>
        `,
        controller:foundItemsDirCtrl,
        //bind controller function to local
        controllerAs:'ctrl',
        bindToController:true 
    };

    return dir;
};
//main directive function 
function foundItemsDirCtrl(){
    let ctrl=this;

    //define removeItem function call
    ctrl.removeItem = function(itemId){

        console.log("Remove item...",itemId);
        //call linked function on parent contoller
        //to remove id from found array on controllers scope
        ctrl.onRemove({
            id:itemId 
        })
    }
};

})()