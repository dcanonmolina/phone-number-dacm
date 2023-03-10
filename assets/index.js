
let device=null;
let call = null;
let syncClient = null;
let syncList = null;

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
            initializeCallHistory(response.data.token, username);

            console.log(response);
            $("#panelData").removeClass("invisible");
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
 
        if(valNewInput.length > 1) return actionCall(valNewInput, input);

        
        $("#phoneDigits").val(input+valNewInput)
        if(call){
            call.sendDigits(valNewInput);
        }
  

    });

    $(".redial").click(function(){
        let result = $(this).next('input').val();
        console.log(result);
    });

    function actionCall(action, inputNumber){
        switch(action){
            case "Call":
                makeCall(inputNumber).
                    then(call => {
                        $("#btnllamar").hide();
                        $("#btnColgar").show();
                        initializeCallEvents(inputNumber,call);
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

function initializeCallEvents(inputnumber, call){
    console.log(call.parameters)

    syncList.push({
        callSid: call.parameters.CallSid,
        number: inputnumber,
        date: new Date()
    },{ttl:21600})
    .then(item => console.log('item added in ', item.index))
    .catch(error => console.error('error while adding item'));

    call.on('disconnect', call => {
        console.log('The call has been disconnected.');
        console.log(call.parameters)
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


const pageHandler = (paginator) => {
    paginator.items.forEach((item) => {
        addDataToTable(item.index, item.data);
    });
    return paginator.hasNextPage
      ? paginator.nextPage().then(pageHandler)
      : null;
  };

function initializeCallHistory(token, username){
    syncClient =  new Twilio.Sync.Client(token);

    syncClient.list({id: username, ttl:43200})
            .then(list =>{
                syncList = list;
                list.getItems({order:'asc'})
                    .then(pageHandler)
                    .catch(err =>console.error('An error has occurred in Twilio Sync: ', err))

                list.on('itemAdded', args =>{
                    addDataToTable(args.item.index, args.item.data);
                })
            })
            .catch(err =>console.error('An error has occurred in Twilio Sync: ', err))

}

function addDataToTable(index, doc){

    const addDataTable = document.getElementById('calls');
    var row = addDataTable.insertRow(1);
    
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);

    cell1.innerHTML = index;
    cell2.innerHTML = doc.date;
    cell3.innerHTML = doc.callSid;
    cell4.innerHTML = doc.number;

    const btn = document.createElement('BUTTON');
    btn.type = 'button';
    btn.innerHTML = 'RE DIAL';
    btn.className = 'redial btn btn-primary';

    var input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("value", doc.number);

    cell5.appendChild(btn); 
    cell5.appendChild(input); 
}