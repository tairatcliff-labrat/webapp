/*global WildRydes _config AmazonCognitoIdentity AWSCognito*/

var WildRydes = window.WildRydes || {};
(function scopeWrapper($) {
    var signinUrl = '/signin.html';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }
    WildRydes.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    WildRydes.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });

    /*
     * Cognito User Pool functions
     */

    function register(givenName, familyName, phoneNumber, pinNumber, password, onSuccess, onFailure) {
        var attributeList = [];

        //var dataEmail = {
        //    Name: 'email',
        //    Value: email
        //};

        var dataGivenName = {
            Name: 'given_name',
            Value: givenName
        };

        var dataFamilyName = {
            Name: 'family_name',
            Value: familyName
        };

        var dataPhoneNumber = {
            Name: 'phone_number',
            Value: phoneNumber
        };

        var dataPinNumber = {
            Name: 'custom:pin_number',
            Value: pinNumber
        };

        //var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributeGivenName = new AmazonCognitoIdentity.CognitoUserAttribute(dataGivenName);
        var attributeFamilyName = new AmazonCognitoIdentity.CognitoUserAttribute(dataFamilyName);
        var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);
        var attributePinNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPinNumber);

        //attributeList.push(attributeEmail);
        attributeList.push(attributeGivenName);
        attributeList.push(attributeFamilyName);
        attributeList.push(attributePhoneNumber);
        attributeList.push(attributePinNumber);

        userPool.signUp(phoneNumber, password, attributeList, null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(userId, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: userId,
            Password: password
        });

        var cognitoUser = createCognitoUser(userId);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(phoneNumber, code, onSuccess, onFailure) {
        createCognitoUser(phoneNumber).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(userId) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: userId,
            Pool: userPool
        });
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
    });

    function handleSignin(event) {
        //var email = $('#emailInputSignin').val();
        var phoneNumber = $('#phoneNumberInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(phoneNumber, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = 'account.html';
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleRegister(event) {
        console.log("Attempting to register a new user");
        var givenName = $('#givenNameInputRegister').val();
        var familyName = $('#familyNameInputRegister').val();
        var phoneNumber = $('#phoneNumberInputRegister').val();
        var pinNumber = $('#pinInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(givenName, familyName, phoneNumber, pinNumber, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        //var email = $('#emailInputVerify').val();
        var phoneNumber = $('#phoneNumberInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(phoneNumber, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }
}(jQuery));
