(function (angular) {
    "use strict";

    angular
        .module("todoApp")
        .directive("todoPaginatedList", [todoPaginatedList])
        .directive("pagination", [pagination]);



    /**
     * Directive definition function of 'todoPaginatedList'.
     * 
     * TODO: correctly parametrize scope (inherited? isolated? which properties?)
     * TODO: create appropriate functions (link? controller?) and scope bindings
     * TODO: make appropriate general directive configuration (support transclusion? replace content? EAC?)
     * 
     * @returns {} directive definition object
     */
    function todoPaginatedList() {
        var directive = {
            restrict: "E", // example setup as an element only
            templateUrl: "app/templates/todo.list.paginated.html",
            scope: {}, // example empty isolate scope
            controller: ["$scope", "$http", "$rootScope", controller],
            link: link
        };

        function controller($scope, $http, $rootScope) {
            $scope.todos = [];
            var page = 1;
            var size = 20;
            var totalItens = 0;
            $scope.loading = true;
            $scope.propertyName = "creationDate";
            $scope.reverse = true;
            
            //load inicial
            $http.get("api/Todo/Todos")
                .then(function (response) {
                    totalItens = response.data.length;
                    $rootScope.$broadcast("carregaDadosBase", { len: totalItens, size: size });

                    $http.get("api/Todo/Paginado/", {
                        params: {
                            size: size,
                            page: page,
                            orderBy: $scope.propertyName,
                            reverse: $scope.reverse
                        }
                    }).then(function (response) {
                        $scope.todos = response.data;
                        $scope.loading = false;
                    });
                });



            $scope.sortBy = function (propertyName) {
                $scope.loading = true;
                $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName)
                    ? !$scope.reverse : false;
                $scope.propertyName = propertyName;
                $http.get("api/Todo/Paginado/", {
                    params: {
                        size: size,
                        page: page,
                        orderBy: $scope.propertyName,
                        reverse: $scope.reverse
                    }
                }).then(
                    function (response) {
                        $scope.todos = response.data;
                        $scope.loading = false;
                    }
                );
            };

            $rootScope.$on("changePageSize", function (ev, args) {
                $scope.loading = true;
                if (args.val == "all") {
                    $http.get("api/Todo/Todos")
                        .then(function (response) {
                            $scope.todos = response.data;
                            $scope.loading = false;
                            $rootScope.$broadcast("carregaDadosBase", { len: totalItens, size: totalItens });
                        });
                } else {
                    size = args.val;
                    $http.get("api/Todo/Paginado/", {
                        params: {
                            size: size,
                            page: page,
                            orderBy: $scope.propertyName,
                            reverse: $scope.reverse
                        }
                    }).then(function (response) {
                        $scope.todos = response.data;
                        $scope.loading = false;
                        $rootScope.$broadcast("carregaDadosBase", { len: totalItens, size: size });
                    });
                }
            });

            $rootScope.$on("changePage", function (ev, args) {
                $scope.loading = true;
                page = args.val;
                $http.get("api/Todo/Paginado/", {
                    params: {
                        size: size,
                        page: page,
                        orderBy: $scope.propertyName,
                        reverse: $scope.reverse
                    }
                }).then(function (response) {
                    $scope.todos = response.data;
                    $scope.loading = false;
                });
            }
            );

        }

        function link(scope, element, attrs) { }

        return directive;
    }

    /**
     * Directive definition function of 'pagination' directive.
     * 
     * TODO: make it a reusable component (i.e. usable by any list of objects not just the Models.Todo model)
     * TODO: correctly parametrize scope (inherited? isolated? which properties?)
     * TODO: create appropriate functions (link? controller?) and scope bindings
     * TODO: make appropriate general directive configuration (support transclusion? replace content? EAC?)
     * 
     * @returns {} directive definition object
     */
    function pagination() {
        var directive = {
            restrict: "E", // example setup as an element only
            templateUrl: "app/templates/pagination.html",
            scope: {}, // example empty isolate scope
            controller: ["$scope", "$http", "$rootScope", controller],
            link: link
        };

        function controller($scope, $http, $rootScope) {
            $scope.infos = {};
            $scope.pageFilters = [10, 20, 30, 'all'];
            
            
            $rootScope.$on("carregaDadosBase", function (ev, args) {
                $scope.infos.totalItens = args.len;
                $scope.infos.totalPages = Math.ceil($scope.infos.totalItens / args.size);
            });

            $scope.changePageSize = function () {
                $rootScope.$broadcast("changePageSize", { val: $scope.infos.pageSize });
            }

            $scope.changePage = function () {
                if ($scope.infos.page > 0 && $scope.infos.page <= $scope.infos.totalPages) {
                    $rootScope.$broadcast("changePage", { val: $scope.infos.page });
                }
            }

            $scope.firstPage = function () {
                $scope.infos.page = 1;
                $rootScope.$broadcast("changePage", { val: 1 });
            }

            $scope.antPage = function () {
                if ($scope.infos.page > 1) {
                    $scope.infos.page = $scope.infos.page - 1;
                    $rootScope.$broadcast("changePage", { val: $scope.infos.page });
                }
            }

            $scope.nextPage = function () {
                if ($scope.infos.page < $scope.infos.totalPages) {
                    $scope.infos.page = $scope.infos.page + 1;
                    $rootScope.$broadcast("changePage", { val: $scope.infos.page });
                }
            }

            $scope.lastPage = function () {
                $scope.infos.page = $scope.infos.totalPages;
                $rootScope.$broadcast("changePage", { val: $scope.infos.page });
            }
        }

        function link(scope, element, attrs) { }

        return directive;
    }

})(angular);

