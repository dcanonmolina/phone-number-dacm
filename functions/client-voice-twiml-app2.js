exports.handler = async function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    const client = context.getTwilioClient();
    const attr = isAValidPhoneNumber(event.To) ? "number" : "client";

    try{

      if(isAValidPhoneNumber(event.To)){
      
          const syncMapItems  = await client.sync.v1.services(process.env.TWILIO_SYNC_SERVICE)
                  .syncMaps('PhoneDir')
                  .syncMapItems
                  .list({limit: 100});

          if(syncMapItems.length == 0){
            twiml.say("Sorry. We do not have agents at the moment");
            return callback(null, twiml);
          }

          const dial = twiml.dial();

          syncMapItems.forEach(s =>{
              
              dial.client(s.key);

          });

          return callback(null, twiml);
       
      }
      else{
          
          twiml.say("Thanks for calling a client!");
      
          const dial = twiml.dial();
          dial.client(event.To);
          return callback(null, twiml);
          
      }
    }catch(err){
      return callback(err);
    }

    
  };
  
  /**
   * Checks if the given value is valid as phone number
   * @param {Number|String} number
   * @return {Boolean}
   */
  function isAValidPhoneNumber(number) {
    return /^[\d\+\-\(\) ]+$/.test(number);
  }
  