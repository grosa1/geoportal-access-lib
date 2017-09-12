define(['gp', 'chai', 'sinon'], function (Gp, chai, sinon) {

    var assert = chai.assert;
    var expect = chai.expect;
    var should = chai.should();

    describe("-- Test sur les messages d'erreur spécifiques du Service de calcul d'itineraire --", function() {

        var Services = null;
        var options = {};

        beforeEach(function() {

            // FIXME uniquement en XHR ! Il n'est pas possible de lever les erreurs en JSONP
            // sauf un TimeOut...

            // options par defaut du geocodage direct
            options = {
                apiKey : 'jhyvi0fgmnuxvfv0zjzorvdn',
                serverUrl : null,
                protocol : 'XHR',
                // proxyURL : (window.proxy) ? 'http://localhost/proxy/php/proxy.php?url=' : null,
                httpMethod : 'GET',
                timeOut : 0,
                rawResponse : false,
                onSuccess : function (response) { console.log('onSuccess() :', response); },
                onFailure : function (error) {console.log("onFailure() : ", error.message, error.type, error.status);},
                // spécifique au service
                api : 'REST',          // FIXME surchargé par l'API !
                outputFormat : 'json', // FIXME surchargé par l'API !
                srs : "EPSG:4326",
                startPoint: {
                 x: 2.64,
                 y: 48.54
                },
                endPoint: {
                 x: 3.01,
                 y: 48.45
                },
                provideBbox : true,
                exclusions : ["Tunnel", "Toll"], // "Bridge",
                distanceUnit : "km",
                graph : "Voiture",
                provideGeometry : false,
                routePreference : "fastest"
            };

        });

        it("Erreur de clef API : clef inconnue du service", function (done) {
            // Exception de type ErrorService
            // Levée par le protocole (XHR)
            // Renvoyer pour le callback onFailure()
            // Message : Errors Occured on Http Request (status : 'Forbidden (...)
            // Type : SERVICE_ERROR
            // Status : 403

            options.apiKey = "bidon";
            options.onFailure = function (e) {
                console.log(e.message);
                expect(e).not.to.be.null;
                expect(e.message).to.contain("No rights for this ressource or ressource does not exist"); // Key does not exist or has expired
                expect(e.type).to.be.equal("SERVICE_ERROR");
                expect(e.status).to.be.equal(403);
                done();
            };
            options.onSuccess = function (response) {
                expect(false).to.be.true;
                done(response);
            }

            Gp.Services.route(options);
        });

        it("Erreur de position : option 'startPoint' non renseignée", function () {
            // Exception de type Error
            // Levée par le constructeur Route(), on ne souhaite pas passer par le callback onFailure()
            // Capturée UNIQUEMENT via un try/catch
            // Message : missing parameter location !
            // (Type : ERROR_USAGE)
            // (Status : -1)
            options.startPoint = null;
            try {
                Gp.Services.route(options);
                should(false).to.be.true;
            } catch (e) {
                console.log(e.message);
                expect(e).not.to.be.null;
                expect(e.message).to.be.equal("Parameter(s) 'startPoint' missing");
            } finally {}
        });

        it("Erreur de position : option 'endPoint' non renseignée", function () {
            // Exception de type Error
            // Levée par le constructeur Route(), on ne souhaite pas passer par le callback onFailure()
            // Capturée UNIQUEMENT via un try/catch
            // Message : missing parameter location !
            // (Type : ERROR_USAGE)
            // (Status : -1)
            options.endPoint = null;
            try {
                Gp.Services.route(options);
                should(false).to.be.true;
            } catch (e) {
                console.log(e.message);
                expect(e).not.to.be.null;
                expect(e.message).to.be.equal("Parameter(s) 'endPoint' missing");
            } finally {}
        });

        xit("NOK Erreur du type d'API : valeur inconnue", function () {
            // Exception de type Error
            // Levée par le constructeur Route(), on ne souhaite pas passer par le callback onFailure()
            // Capturée UNIQUEMENT via un try/catch
            // Message : Type API value not supported or unknown !
            // (Type : ERROR_USAGE)
            // (Status : -1)

            // FIXME
            // les readers OLS ne sont pas implémentés. on utilise donc toujours l'API REST.
            options.api = 'BIDON';
            try {
                Gp.Services.route(options);
                expect(false).to.be.true;
            } catch (e) {
                console.log(e.message);
                expect(e).not.to.be.null;
                expect(e.message).to.be.equal("Value(s) for parameter(s) 'api' unknown");
            } finally {}
        });

        it("Erreur du format de sortie : valeur inconnue", function () {
            // Exception de type Error
            // Levée par le constructeur Route(), on ne souhaite pas passer par le callback onFailure()
            // Capturée UNIQUEMENT via un try/catch
            // Message : Url by default not found !
            // (Type : ERROR_USAGE)
            // (Status : -1)

            // FIXME
            // les readers OLS ne sont pas implémentés. on utilise donc toujours l'API REST.
            // avec le format de sortie en json
            options.outputFormat = 'BIDON';
            try {
                Gp.Services.route(options);
                should(false).to.be.true;
            } catch (e) {
                console.log(e.message);
                expect(e).not.to.be.null;
                expect(e.message).to.be.equal("Url by default not found !");
            } finally {}
        });

        it("Erreur sur les exclusions : valeur inconnue", function (done) {
            // Exception de type ErrorService
            // Levée par XHR()
            // Renvoyer pour le callback onFailure()
            // Message : (...) ServiceException (...)
            // Type : SERVICE_ERROR
            // Status : 500
            //  ex. de message du service :
            //  {"message":"ServiceException: Error in route computation\nError in smartrouting\nFailed to execute calculateRoute\nunknown reject flag 'BIDON'","status":"ERROR"}

            options.exclusions = ['BIDON'];
            options.onFailure = function (e) {
                console.log(e);
                expect(e).not.to.be.null;
                expect(e.message).to.contain("ServiceException");
                expect(e.type).to.be.equal("SERVICE_ERROR");
                expect(e.status).to.be.equal(500);
                done();
            };
            options.onSuccess = function (response) {
                done(response);
            };

            Gp.Services.route(options);
        });

        it("Erreur sur le graphe : valeur inconnue", function (done) {
            // Exception de type ErrorService
            // Levée par XHR()
            // Renvoyer pour le callback onFailure()
            // Message : (...) ServiceException (...)
            // Type : SERVICE_ERROR
            // Status : 500
            //  ex. de message du service :
            //  {"message":"ServiceException: Error in route computation\nError in smartrouting\nFailed to execute calculateRoute\nunknown reject flag 'BIDON'","status":"ERROR"}

            options.graph = 'BIDON';
            options.onFailure = function (e) {
                console.log(e);
                expect(e).not.to.be.null;
                expect(e.message).to.contain("ServiceException");
                expect(e.type).to.be.equal("SERVICE_ERROR");
                expect(e.status).to.be.equal(500);
                done();
            };
            options.onSuccess = function (response) {
                done(response);
            };

            Gp.Services.route(options);
        });
    });
});