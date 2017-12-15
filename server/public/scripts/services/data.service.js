myApp.service('DataService', function ($http, $location, $q) {
    console.log('DataService Loaded');
    var self = this;
    self.data = {
        data: '',
        inventory: '',
        vacancy: '',
        properties: '',
        allProperties: ''
    };
    
    self.userObject = {};

    self.uploaderOptions = {
        url: '/data/csv/',
        onSuccess: function(response, status, headers) {
            console.log('data uploaded');
        }
    };

    //Retrieve all properties
    self.getAllProperties = function() {
        // get the cache data instead of doing another call to the server
        if (self.data.allProperties) {
            return $q(function (resolve, reject) {
                resolve(self.data.allProperties);
            });
        }

        return $http.get('/data/properties/all').then(function(response){
            self.data.allProperties = response.data;
            console.log('Succesfully retrieved ALL properties', self.data.allProperties);
            return response.data;
        }).catch(function(err){
            console.log('Error retrieving all properties', err);
        });
    };

    //Retrieve data for table and inventory on Market Page
    self.getMarketData = function (value) {
        return $http.get(`/data/all?year=${value.year}&quarter=${value.quarter}&market=${value.market}`).then(function (response) {
            self.data.data = response.data;
            console.log('Succesfully retrieved market data', response.data);
        }).catch(function (err) {
            console.log('Error retrieving market data', err)
        })
    }

    //Return time-based absorption information for chart
    self.getAbsorptionData = function (value) {
        return $http.get(`/data/absorption?market=${value.market}`).then(function (response) {
            self.data.inventory = response.data;
            console.log('Succesfully retrieved absorption', self.data.inventory);
        }).catch(function (err) {
            console.log('Error retrieving absorption', err)
        })
    }

    //Return time-based vacancy information for chart
    self.getVacancyData = function(value) {
        return $http.get(`/data/vacancy?market=${value.market}`).then(function (response) {
            self.data.vacancy = response.data;
            console.log('Succesfully retrieved vacancy', self.data.vacancy);
        }).catch(function (err) {
            console.log('Error retrieving vacancy', err)
        })
    }

    self.getMarketPropertyData = function (value) {
        let coords = [];
        //Properties locations for map       
        $http.get(`/data/properties?year=${value.year}&quarter=${value.quarter}&market=${value.market}`).then(function (response) {
            response.data.forEach(function (item) {
                coords.push([item.X, item.Y]);
            })
            self.data.properties = coords;
        }).catch(function (err) {
            console.log('Error retrieving property data', err)
        })
    }

});
