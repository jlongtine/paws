// ==UserScript==
// @name         Paws
// @namespace    http://tombenner.co/
// @version      0.0.1
// @description  Keyboard shortcuts for the AWS Console
// @author       Tom Benner
// @match        https://*.console.aws.amazon.com/*
// @grant        none
// @require https://code.jquery.com/jquery-1.11.3.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/mousetrap/1.4.6/mousetrap.js
// @require https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore.js
// ==/UserScript==

$.noConflict();

var Paws = {};

Paws.App = (function () {
    var self = this;

    self.commandsCallbacks = {
        //Home
        'home': {href: '/console'},
        // Services
        'acm': {href: '/acm/home'},
        'cb': {href: '/codesuite/codebuild/projects'},
        'ct': {href: '/cloudtrail/home#/events'},
        'cfn': {href: '/cloudformation/home'},
        'ccw': {href: '/cloudwatch/home'},
        'cwe': {href: '/cloudwatch/home#events:'},
        'cwl': {href: '/cloudwatch/home#logs:'},
        'cwa': {href: '/cloudwatch/home#alarm:'},
        'ec2': {href: '/ec2/v2/home#Instances:sort=desc:launchTime'},
        'eks': {href: '/eks/home'},
        'ecs': {href: '/ecs/home'},
        'ecr': {href: '/ecr/repositories'},
        'kms': {href: '/kms/home'},
        'ssm': {href: '/systems-manager/home'},
        'sec': {href: '/elasticache/home'},
        'iam': {href: '/iam/home#home'},
        'params': {href: '/systems-manager/parameters'},
        'r53': {href: '/route53/home#hosted-zones:'},
        'rds': {href: '/rds/home#dbinstances:'},
        'red': {href: '/redshift/home#cluster-list:'},
        's3': {href: '/s3/home'},
        'vpc': {href: '/vpc/home'},
        'da': {href: '/lambda/home'},
        // Pages
        'img': {href: '/ec2/v2/home#Images:sort=name'},
        'vol': {href: '/ec2/v2/home#Volumes:sort=desc:createTime'},
        'elb': {href: '/ec2/v2/home#LoadBalancers:'},
        'scg': {href: '/ec2/v2/home#SecurityGroups:sort=groupId'},
        // Navbar
        'j': {func: ['navbar', 'next']},
        'k': {func: ['navbar', 'prev']},
        'l': {func: ['navbar', 'select']},
        'return': {func: ['navbar', 'select']}, // This doesn't work on some services
        // Miscellaneous
        '/': {click: 'nav-servicesMenu'},
        '?': {open: 'https://github.com/tombenner/paws#shortcuts'},
        // lambda searchbox ???? WIP
        'lam': {focus: '.inputAndSuggestions.input'},
        'z': {click: 'nav-servicesMenu'},

        // Regions
        'reg': {click: 'nav-regionMenu'},
        'acc': {click: 'nav-usernameMenu'},
        'use2': {region: 'us-east-2'},
        'use1': {region: 'us-east-1'},
        'usw1': {region: 'us-west-1'},
        'usw2': {region: 'us-west-2'},
        'aps1': {region: 'ap-south-1'},
        'apne3': {region: 'ap-northeast-3'},
        'apne2': {region: 'ap-northeast-2'},
        'apse1': {region: 'ap-southeast-1'},
        'apse2': {region: 'ap-southeast-2'},
        'apne1': {region: 'ap-northeast-1'},
        'cac1': {region: 'ca-central-1'},
        'cnn1': {region: 'cn-north-1'},
        'cnnw1': {region: 'cn-northwest-1'},
        'euc1': {region: 'eu-central-1'},
        'euw1': {region: 'eu-west-1'},
        'euw2': {region: 'eu-west-2'},
        'euw3': {region: 'eu-west-3'},
        'eun1': {region: 'eu-north-1'},
        'sae1': {region: 'sa-east-1'},
    };

    self.init = function () {
        self.navbar = new Paws.Navbar();
        self.initCommands();
        self.log('Initialized');
    };

    self.initCommands = function () {
        _.each(self.commandsCallbacks, function (value, key) {
            var command = key;
            command = command.split('').join(' ');
            var callback;
            if (value['href']) {
                callback = function () {
                    self.log('Redirecting to ' + value['href']);
                    window.location.href = value['href'];
                };
            } else if (value['open']) {
                callback = function () {
                    self.log('Opening ' + value['open']);
                    window.open(value['open']);
                };
            } else if (value['focus']) {
                callback = function () {
                    self.log('Selecting ' + value['focus']);
                    jQuery(value['focus']).focus();
                };
            } else if (value['func']) {
                callback = function () {
                    self.log('Calling func');
                    var func = value['func'];
                    self[func[0]][func[1]]();
                };
            } else if (value['click']) {
                callback = function() {
                    self.log('Clicking ' + value['click']);
                    document.getElementById(value['click']).click();
                };
            } else if (value['region']) {
                callback = function() {
                    self.log('Switching to region: ' + value['region']);
                    document.querySelector("#regionMenuContent > a.region[data-region-id='" + value['region'] + "']").click();
                };
            } else if (value['account']) {
                callback = function() {
                    self.log('Switching to account: ' + value['account']);
                    document.querySelector("form[data-aesr-profile='"+ value['account'] +"'] > input[type='submit']").click();
                };
            } else {
                self.log('Invalid callback');
            }
            Mousetrap.bind(command, function () {
                callback();
                return false;
            });
        });
    };

    self.log = function (message) {
        console.log('Paws: ' + message);
    };

    self.init();

    return self;
});

Paws.Navbar = (function () {
    var self = this;

    self.select = function () {
        var selectedAnchor = self.getSelectedAnchor();
        if (selectedAnchor.length == 0) {
            return;
        }
        // The [0] is necessary for the click to work on RDS
        selectedAnchor[0].click();
    };

    self.unfocus = function () {
        var selectedAnchor = self.getSelectedAnchor();
        if (selectedAnchor.length == 0) {
            return;
        }
        selectedAnchor.blur();
        selectedAnchor.removeClass('ak-navbar-selected');
        selectedAnchor.css('background-color', '');
    };

    self.next = function () {
        self.anchors = jQuery('.gwt-Anchor');
        var selectedAnchor = self.getSelectedAnchor();
        if (selectedAnchor.length == 0) {
            self.selectAnchor(self.anchors.first());
        } else {
            var index = self.anchors.index(selectedAnchor);
            var anchorToSelect = self.anchors.eq(index + 1);
            self.selectAnchor(anchorToSelect);
        }
    };

    self.prev = function () {
        self.anchors = jQuery('.gwt-Anchor');
        var selectedAnchor = self.getSelectedAnchor();
        if (selectedAnchor.length == 0) {
            self.selectAnchor(self.anchors.last());
        } else {
            var index = self.anchors.index(selectedAnchor);
            var anchorToSelect = self.anchors.eq(index - 1);
            self.selectAnchor(anchorToSelect);
        }
    };

    self.getSelectedAnchor = function () {
        return self.anchors.filter('.ak-navbar-selected:first');
    };

    self.selectAnchor = function (anchor) {
        self.anchors.removeClass('ak-navbar-selected');
        self.anchors.css('background-color', '');
        anchor.css('background-color', 'LightCyan');
        anchor.addClass('ak-navbar-selected');
        anchor.focus();
    };
});

new Paws.App();
