const AccessToken = require('twilio').jwt.AccessToken;
const MAX_ALLOWED_SESSION_DURATION = 14400;

exports.handler = function(context, event, callback) {

    const id = event.identity;
    const pwd = event.pwd;

    if(pwd!=context.PASSWORD) return callback("Internal error ocurred");

    const token = new AccessToken(
        context.ACCOUNT_SID,
        context.API_KEY,
        context.API_SECRET,
        { identity: id,
          ttl: MAX_ALLOWED_SESSION_DURATION },
        
      );

    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: context.OUTGOING_SID,
    incomingAllow: true, // allows your client-side device to receive calls as well as make them
    pushCredentialSid: context.PUSH_NOTIFICATION
    });

    const SyncGrant = AccessToken.SyncGrant;
    const syncGrant = new SyncGrant({
      serviceSid: context.TWILIO_SYNC_SERVICE
    })


    token.addGrant(syncGrant);
    token.addGrant(voiceGrant);

    const response = new Twilio.Response();

    // Uncomment these lines for CORS support
    response.appendHeader('Access-Control-Allow-Origin', '*');
    // response.appendHeader('Access-Control-Allow-Methods', 'GET');
    // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    response.appendHeader("Content-Type", "application/json");
    response.setBody({
      identity: id,
      token: token.toJwt()
    });
    callback(null, response);
  };
  