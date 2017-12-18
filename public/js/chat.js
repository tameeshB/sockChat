(function () {
    var app = angular.module('sockchat', []);

    app.controller('StoreController', function () {
        this.product = gem;
    });


    app.controller('ReviewController', function () {
        this.review = {};

        this.addReview = function (product) {
            product.reviews.push(this.review);

            this.review = {};
        };
    });
})();
