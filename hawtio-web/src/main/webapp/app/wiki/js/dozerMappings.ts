module Wiki {
  export function DozerMappingsController($scope, $location, $routeParams, workspace:Workspace, jolokia, wikiRepository:GitWikiRepository) {
    Wiki.initScope($scope, $routeParams, $location);

    $scope.schema = {};
    $scope.addDialog = new Core.Dialog();
    $scope.propertiesDialog = new Core.Dialog();

    $scope.selectedItems = [];
    $scope.mappings = [];

    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      data: 'mappings',
      displayFooter: false,
      showFilter: false,
      //sortInfo: { field: 'timestamp', direction: 'DESC'},
      filterOptions: {
        filterText: "searchText"
      },
      columnDefs: [
        {
          field: 'classA',
          displayName: 'From',
          cellTemplate: '<div class="ngCellText">{{row.entity.classA.name}}</div>'
        },
        {
          field: 'classB',
          displayName: 'To',
          cellTemplate: '<div class="ngCellText">{{row.entity.classB.name}}</div>'
        }
      ]
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });


    $scope.addAndCloseDialog = () => {
      /*
       var nodeModel = $scope.selectedNodeModel();
       if (nodeModel) {
       addNewNode(nodeModel);
       }
       */
      $scope.addDialog.close();
    };

    $scope.removeNode = () => {
      /*
       var folder = getSelectedOrRouteFolder();
       if (folder) {
       var nodeName = Camel.getFolderCamelNodeId(folder);
       folder.detach();
       if ("route" === nodeName) {
       // lets also clear the selected route node
       $scope.selectedRouteId = null;
       }
       updateSelection(null);
       treeModified();
       }
       */
    };

    $scope.save = () => {
      // generate the new XML
      /*
       if ($scope.rootFolder) {
       var xmlNode = Camel.generateXmlFromFolder($scope.rootFolder);
       if (xmlNode) {
       var text = Core.xmlNodeToString(xmlNode);
       if (text) {
       // lets save the file...
       var commitMessage = $scope.commitMessage || "Updated page " + $scope.pageId;
       wikiRepository.putPage($scope.branch, $scope.pageId, text, commitMessage, (status) => {
       Wiki.onComplete(status);
       goToView();
       Core.$apply($scope);
       });
       }
       }
       }
       */
    };

    $scope.cancel = () => {
      console.log("cancelling...");
      // TODO show dialog if folks are about to lose changes...
    };

    $scope.onRootTreeNode = (rootTreeNode) => {
      $scope.rootTreeNode = rootTreeNode;
    };

    $scope.onNodeSelect = (folder, treeNode) => {
      $scope.selectedFolder = folder;
      $scope.treeNode = treeNode;
      $scope.propertiesTemplate = null;
      $scope.dozerEntity = null;
      if (folder) {
        var entity = folder.entity;
        $scope.dozerEntity = entity;
        var propertiesTemplate = "app/wiki/html/dozerPropertiesEdit.html";
        if (entity instanceof Dozer.Field) {
          //var field: Dozer.Field = entity;
          $scope.propertiesTemplate = propertiesTemplate;
          $scope.nodeModel = io_hawt_dozer_schema_Field;
        }
        else if (entity instanceof Dozer.Mapping) {
          //var mapping: Dozer.Mapping = entity;
          $scope.propertiesTemplate = propertiesTemplate;
          $scope.nodeModel = io_hawt_dozer_schema_Mapping;
        }
      }
      Core.$apply($scope);
    };



    updateView();

    function updateView() {
      $scope.pageId = Wiki.pageId($routeParams, $location);
      if (Git.getGitMBean(workspace)) {
        $scope.git = wikiRepository.getPage($scope.branch, $scope.pageId, $scope.objectId, onResults);
      }
    }

    function onResults(response) {
      var text = response.text;
      if (text) {
        // lets remove any dodgy characters so we can use it as a DOM id
        $scope.model = Dozer.loadDozerModel(text, $scope.pageId);
        $scope.mappings = Core.pathGet($scope.model, ["mappings"]);
        //console.log("Has mappings " + JSON.stringify($scope.mappings, null, '  '));
        $scope.mappingTree = Dozer.createDozerTree($scope.model);
      } else {
        console.log("No XML found for page " + $scope.pageId);
      }
      Core.$applyLater($scope);
    }
  }
}