app.controller('bibListeEditCtrl',[ '$scope','$filter', '$http','$uibModal','$route','$routeParams','NgTableParams','toaster', 'backendCfg','loginSrv',
  function($scope,$filter, $http,$uibModal,$route, $routeParams,NgTableParams,toaster,backendCfg,loginSrv) {
    var self = this;
    self.route='listes';
    self.showSpinner = true;
    self.pictos_propose = [];
    self.edit_detailliste = {};
    self.edit_regne = [];
    self.edit_group2_inpn=[];
    self.edit_picto_db = [];
    self.edit_picto_projet=[];
    list_prototype = {
    };


    //----------------------Gestion des droits---------------//
    if (loginSrv.getCurrentUser()) {
        self.userRightLevel = loginSrv.getCurrentUser().id_droit_max;
        // gestion de l'onglet actif ; 0 par default
        if (self.userRightLevel==backendCfg.user_low_privilege) {
        self.activeForm = 2;
        }
    }
    self.userRights = loginSrv.getCurrentUserRights();

//-----------------------Get data in list by id liste-----------------------------------------------
    $http.get(backendCfg.api_url+"biblistes/edit/"+$routeParams.id).then(function(response) {
        self.edit_detailliste = response.data;
        list_prototype = angular.copy(self.edit_detailliste);
    });
//-----------------------Get list of regne-----------------------------------------------
    $http.get(backendCfg.api_url+"biblistes/edit/regne").then(function(response) {
        self.edit_regne = response.data;
    });
 //-----------------------Get list of group2_inpn-----------------------------------------------
    $http.get(backendCfg.api_url+"biblistes/edit/group2_inpn").then(function(response) {
        self.edit_group2_inpn = response.data;
    });

//-----------------------Get list of picto  in database biblistes -----------------------------------------------
    $http.get(backendCfg.api_url+"biblistes/edit/picto_biblistes").then(function(response) {
        self.edit_picto_db = response.data;
    });
//----------------------- Get list of nom_list
    $http.get(backendCfg.api_url+"biblistes/edit/nom_liste").then(function(response) {
        self.edit_nom_liste = response.data;
    });
//-----------------------Get list of picto in dossier ./static/images/pictos -----------------------------------------------
    $http.get(backendCfg.api_url+"biblistes/edit/picto_projet").then(function(response) {
        self.edit_picto_projet = response.data;
        
        //--- call filter pcitos to get corresponds pictos on interface list of picto
        self.pictos_propose = filterPictos(self.edit_picto_projet,self.edit_picto_db,self.edit_detailliste.picto);

        //----- stop spinner ------
        self.showSpinner = false;
    });


    var toasterMsg = {
        'saveSuccess':{"title":"Taxon enregistré", "msg": "Le taxon a été enregistré avec succès"},
        'submitError_nom_liste':{"title":"Nom de la liste existe déjà"},
        'submitInfo_nothing_change':{"title":"L'Information de la liste ne change pas"},
        'saveError':{"title":"Erreur d'enregistrement"},
    }

    self.submit = function() {
        var flow = true;

        // -- if data in form doesn't change -> toaster L'Information de la liste ne change pas
        if(JSON.stringify(list_prototype) === JSON.stringify(self.edit_detailliste)){
            toaster.pop('info', toasterMsg.submitInfo_nothing_change.title,"", 5000, 'trustedHtml');
            flow = false;
        }
        //-- traiter le nom, si il existe déjà, ne faire pas submit
        if(flow){
            var new_list_name = self.edit_nom_liste.filter(removeCurrentListName);
            for(i = 0; i < new_list_name.length; i++)
                if(new_list_name[i] == self.edit_detailliste.nom_liste){
                    toaster.pop('error', toasterMsg.submitError_nom_liste.title,"", 5000, 'trustedHtml');
                    flow = false;
                    break;
                }
        }

        // -- Submit
        if (flow) {
            var url = backendCfg.api_url +"biblistes/edit/" + self.edit_detailliste.id_liste;
            var res = $http.put(url, self.edit_detailliste,{ withCredentials: true })
            .then(
               function(response){
                    toaster.pop('success', toasterMsg.saveSuccess.title, toasterMsg.saveSuccess.msg, 5000, 'trustedHtml');
               }, 
               function(response){
                    toaster.pop('error', toasterMsg.saveError.title, response.data.message, 5000, 'trustedHtml');
               }
            );
            $route.reload();  
        }  
    }

    //--- a paramettre of javascript array.filtre(para)
    function removeCurrentListName(value) {
        return value !=  list_prototype.nom_liste;
    }
    
    //---- filtre pictos
    function filterPictos(picto_projet,picto_db,edit_detailliste_picto){
        var pictos_propose = [];

        // ----- compare the difference into 2 pictos listes: on database and in projet
        // ----- then save the differeces pictos into an array.
        // ----- use this array as the options for selection list on interface
        
        for(i = 0; i < picto_projet.length; i++)
        {
            var path = "images/pictos/"+picto_projet[i];
            for(j = 0; j < picto_db.length; j++)
            {
                if(path.localeCompare(picto_db[j]) == 0)
                {
                    break;
                }
                if(j == picto_db.length - 1)
                    pictos_propose.push(picto_projet[i]) ;
            }
        }
        // -- add nopicto
        for(i = 0; i < pictos_propose.length; i++){
            if(pictos_propose[i] === "nopicto.gif") 
                break;
            if(i === pictos_propose.length - 1) 
                pictos_propose.push("nopicto.gif");
        }
        // -- add currently picto
        var picto_string = edit_detailliste_picto.substring(14);
        if(picto_string != "nopicto.gif")
            pictos_propose.push(picto_string);
        return pictos_propose;
    }

}]);