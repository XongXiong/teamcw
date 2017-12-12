myApp.controller('EmailController', function (UserService, $location, UploadService) {
    console.log('EmailController created');
    var self = this;
    self.userService = UserService;
    
    self.uploaderOptions = {
        url: '/email/csv/'
    };

    self.uploader = UploadService.uploader;

    self.emailUpload = function() {
        self.uploader.uploadItem(0);
        $location.path('/email-list');
    };
    
    self.emailTemplate = "mailto:jd@abc.com?subject=Leasing%20Report&body=Good afternoon Mr. Buettner,%0D%0A I will be delivering our 2017 Facilities Leasing Report to corporate office users residing in the Minneapolis area within the next few weeks and am searching for the appropriate person in your office to deliver it to. I have attached a Market Snapshot from our 2016 edition for your review.%0D%0A %0D%0A What is the report: %0D%0A Following recent activity and new best practices in corporate real estate management, we have assembled a report that is useful for corporate users looking to evaluate their space needs in the upcoming 12-24 months, in addition to firms that would simply like to stay current with the national and local market. %0D%0A %0D%0A The report cites:%0D%0A   1. Average local asking rents from landlords %0D%0A   2. Average local operating costs and taxes %0D%0A   3. Average local tenant build-out allowances %0D%0A   4. Federal Accounting Standard Boards (FASB) changes and impacts to portfolio real estate %0D%0A   5. Recent Twin Cities major lease transactions %0D%0A   6. A market analysis for portfolio companies %0D%0A %0D%0AIt would be a big help if you can refer me an appropriate time to deliver the report or the appropriate person I should contact.    ";

});
