
let device=null;
let call = null;
$(document).ready(function(){

    $("#loginbtn").click(function(){
        let username = $("#username").val();
        let password = $("#password").val();

        if(!username || !password) return alert("Please Enter login values");

        axios.post('/getTokenPhone', {
            identity: username,
            pwd: password
          })
          .then(function (response) {

            initializePhoneNumber(response.data.token);

            console.log(response);
            $("#phoneNumber").removeClass("invisible");
            $("#btnColgar").hide();
            $("#login").hide();
          })
          .catch(function (error) {
            console.log(error);
            alert(error)
          });

        
    });

    $("#phoneNumber .btn").click(function(){

        let valNewInput = $( this ).text();
        let input = $("#phoneDigits").val();
        console.log(valNewInput.length)
        if(valNewInput.length > 1) return actionCall(valNewInput, input);

        
        $("#phoneDigits").val(input+valNewInput)
        if(call){
            call.sendDigits(valNewInput);
        }
  

    });

    function actionCall(action, inputNumber){
        switch(action){
            case "Call":
                makeCall(inputNumber).
                    then(call => {
                        $("#btnllamar").hide();
                        $("#btnColgar").show();
                        initializeCallEvents(call);
                    })
                break;
            default:
                $("#btnllamar").show();
                $("#btnColgar").hide();
                $("#phoneDigits").val("");
                if(call){
                    call.disconnect();
                }
                break;
        }
    }


});

async function  makeCall(number){
    call = await device.connect({ 
        params: {
          To: number
        } 
      });
      
    return call;
}

function initializeCallEvents(call){
    call.on('disconnect', call => {
        console.log('The call has been disconnected.');
        $("#btnllamar").show();
         $("#btnColgar").hide();
         $("#phoneDigits").val("");
       });

    call.on('cancel', () => {
        console.log('The call has been canceled.');
        $("#btnllamar").show();
         $("#btnColgar").hide();
         $("#phoneDigits").val("");
       });
}

function initializePhoneNumber(token){
    device = new Twilio.Device(token);
    device.register();

    device.addListener('registered', device => {
        console.log('The device is ready to receive incoming calls.')
      });

    device.on('incoming', call => {
        if(confirm("A call from " + call.callerInfo)){
            call.accept();
        }
        else{
            call.reject();
        }
    });

    device.on('error', (twilioError, call) => {
        console.log('An error has occurred: ', twilioError);
       });
}