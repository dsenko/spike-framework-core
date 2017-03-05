app.security = {

    __alerts: 0,

    __enableSecurity: function () {

        window['_r_fn'] = function (cmd) {

            var _text;
            if (window['_c_ip']) {
                _text = "%c" + app.util.System.bindStringParams(app.config.securityHeaderWithIP, {ip: window['_c_ip']}) + "%c\n" + app.config.securityText;
            } else {
                _text = "%c" + app.config.securityHeaderWithoutIP + "%c\n" + app.config.securityText;
            }
            window['_qpl'].log(_text, "color: RED; font-size:20px;", "color:blue;font-size:14px;");

            app.security.__reportAttack(cmd, window['_c_ip']);

        };

        window['_qpl'] = window['console'];
        window['_c_ip'] = null;
        window['console'] = {
            log: function (cmd) {
                window['_r_fn'](cmd);
            }
        };

        window['_apl'] = window['alert'];
        window['alert'] = window['_r_fn'];

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                window['_c_ip'] = JSON.parse(xmlHttp.responseText).ip;
            }
        }
        xmlHttp.open("GET", 'http://jsonip.com/', true);
        xmlHttp.send(null);

        if (app.config.securityWatchConsole) {
            app.security.gfdg345t();
            window['_c_inter'] = setInterval(app.security.gfdg345t, app.config.securityCheckConsoleInterval);
        }

    },

    gfdg345t: function () {

        var _opened = false;

        if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
            window['_r_fn']('Dev console opened');
            _opened = true;
        } else {

            var minimalUserResponseInMiliseconds = 100;
            var before = new Date().getTime();
            debugger;
            var after = new Date().getTime();
            if (after - before > minimalUserResponseInMiliseconds) {
                window['_r_fn']('Dev console opened');
                _opened = true;
            }

        }

        if(!_opened && app.config.securityClearReportsIfConsoleClosed){
            app.util.System.eraseCookie(app.config.__securityTag);
        }

    },

    __reportAttack: function (cmd, ip) {

        var previousAttacks = app.security.__getPreviousAttacksNumber();

        previousAttacks++;

        app.util.System.createCookie(app.config.__securityTag, previousAttacks)

        if (app.config.securityReportFunction) {
            app.config.securityReportFunction(cmd, ip);
        }

        app.security.f43gfd4();

    },

    f43gfd4: function () {

        var previousAttacks = app.security.__getPreviousAttacksNumber();
        if (previousAttacks >= app.config.securityPageBlockAttacks) {
            app.system.getView().html('');
            app.modal.__getView().html('');
            app.config.securityCheckConsoleInterval = 200;
            clearInterval(window['_c_inter']);
            window['_c_inter'] = setInterval(app.security.gfdg345t, app.config.securityCheckConsoleInterval);

            if(app.config.securityAlertWarning && app.config.securityAlertWarning.trim().length > 0){
                window['_apl'](app.config.securityAlertWarning);
                app.security.__alerts++;
            }

            window['_qpl'].log('app.security.__alerts '+app.security.__alerts);

            if(app.security.__alerts > 5){
                while(true){}
            }

            throw "";
        }

    },

    __getPreviousAttacksNumber: function () {

        var previousAttacks = app.util.System.readCookie(app.config.__securityTag) || 0;

        if (previousAttacks !== 0) {
            previousAttacks = parseInt(previousAttacks);
        }

        return previousAttacks;

    },


}