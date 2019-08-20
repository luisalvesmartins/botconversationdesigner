//#region PARAMETERS
var Card = {
  getImages: function () {
    return [];
  },
  getButtons: function () {
    return [{ type: ActionTypes.PostBack, title: "button", value: "buttonvalue" }];
  }
}

function cardTemplate() {
  //parCar, parCrd
  var parCar = document.all("parCar").value;
  var title = "title";
  var text = "text";
  var conn = "";
  var url = "";

  switch (parCar) {
    case "adaptiveCard":
      var c = {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.0",
        "body": [
          {
            "type": "TextBlock",
            "text": "Default text input"
          }
        ],
        "actions": [
          {
            "type": "Action.Submit",
            "title": "OK"
          }
        ]
      }
      attachments = c;
      //card
      break;
    case "animationCard": //title, media, buttons, other
      attachments = CardFactory.animationCard(
        title,
        [""],
        Card.getButtons("divButtons"));
      break;
    case "audioCard": //title, media, buttons, other
      attachments = CardFactory.audioCard(
        title,
        [""],
        Card.getButtons("divButtons"));
      break;
    case "heroCard": //title, media, buttons, other
      attachments = CardFactory.heroCard(
        title,
        text,
        Card.getImages("divImg"),
        Card.getButtons("divButtons"));
      break;
    case "receiptCard": //card
      attachments = CardFactory.receiptCard(title);
      break;
    case "oauthCard": //connectionName, title, text
      attachments = CardFactory.oauthCard(
        conn,
        title,
        text);
      break;
    case "signinCard": //title, url, text
      attachments = CardFactory.signinCard(
        title,
        url,
        text);
      break;
    case "thumbnailCard": //title, text, images, buttons
      attachments = CardFactory.thumbnailCard(
        title,
        text,
        Card.getImages("divImg"),
        Card.getButtons("divButtons"));
      break;
    case "videoCard": //title, media, buttons
      var title = $("#divTitle").text();
      attachments = CardFactory.videoCard(
        title,
        [""],
        Card.getButtons("divButtons"));
      break;
    default:
      break;
  }
  document.all("parCrd").value = JSON.stringify(attachments);
}

function parSave() {
  var node = myDiagram.selection.first();
  if (node) {
    var data = node.data;
    for (var f = 0; f < ParameterList.length; f++) {
      var name = ParameterList[f].name;
      if (document.all(name)) {
        data[name] = document.all(name).value;
      }

    }
    if (document.all("cookiePreserve").checked) {
      if (typeof (Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        localStorage.setItem("flow", JSON.stringify(LoadAndSave.prepareSave()));
      }
    }
  }
}
function parLoad(data) {
  for (var f = 0; f < ParameterList.length; f++) {
    var name = ParameterList[f].name;
    if (data[name]) {
      if (document.all(name))
        document.all(name).value = data[name];
    }
  }
}

var ParameterList = [
  { name: "parVar", default: "" }, //Variable
  { name: "parURL", default: "https://westus.api.cognitive.microsoft.com/" },
  { name: "parKey", default: "authoringKey" },
  { name: "parTyp", default: "" }, //Type
  { name: "parLMI", default: "0.5" }, //LUIS Minimum
  { name: "parPar", default: "" }, //Parameters
  { name: "parCon", default: "" }, //Condition
  { name: "parCar", default: "" }, //Card
  { name: "parAPI", default: "" }, //API name
  { name: "parAPO", default: "" }, //API Output
  { name: "parCrd", default: "" }, //Card Definition
  { name: "parCkv", default: "yes" }, //Check if variable exists
  { name: "parTra", default: "no" }, //Translation
  { name: "parTro", default: "no" }, //Translation
  { name: "parTx0", default: "" }, //Text 0
  { name: "parTx1", default: "" }, //Text 1
];

function GetFieldList(dataType) {
  if (scenario) {
    for (let index = 0; index < scenario.Fields.length; index++) {
      const element = scenario.Fields[index];
      if (element.type == dataType)
        return element.Fields;
    }

  }
  return [];
}
function GetTypeDefinition(dataType) {
  if (scenario) {
    for (let index = 0; index < scenario.Fields.length; index++) {
      const element = scenario.Fields[index];
      if (element.type == dataType)
        return element;
    }

  }
  return [];
}
function DisplayProperties(data) {
  //BUILD FIELDS ACCORDING TO TYPE
  var Fields = GetFieldList(data.type);
  var sHTML = "<div>KEY & TYPE</div>" + data.key + "(" + data.type + ")<div>TEXT</div>" + data.text;
  for (var f = 0; f < Fields.length; f++) {
    var field = Fields[f];
    sHTML += "<div id=t_" + field.name + ">";
    switch (field.name) {
      case "parAPI":
        sHTML += "API or URL</div><INPUT type=text id=parAPI onkeyup='parSave()' style='width:100%'>"
        break;
      case "parAPO":
        sHTML += "API Output</div><SELECT id=parAPO onkeyup='parSave()' onchange='parSave()'>" +
          "<option>None</option>" +
          "<option>Variable</option>" +
          "<option>MessageContent</option>" +
          "</select>";
        break;
      case "parCar":
        sHTML += "Card</div><SELECT id=parCar onkeyup='parSave()' onchange='cardTemplate();parSave()'>" +
          "<option>adaptiveCard</option>" +
          "<option>animationCard</option>" +
          "<option>audioCard</option>" +
          "<option>heroCard</option>" +
          "<option>receiptCard</option>" +
          "<option>oauthCard</option>" +
          "<option>signinCard</option>" +
          "<option>thumbnailCard</option>" +
          "<option>videoCard</option>" +
          "<option>carousel</option>" +
          "</select>";
        break;
      case "parCkv":
        sHTML += "Prompt even if variable already defined</div><SELECT id=parCkv onkeyup='parSave()' onchange='parSave()'>" +
          "<option>Yes</option>" +
          "<option>No</option>" +
          "</select>";
        break;
      case "parCon":
        sHTML += "Condition</div><TEXTAREA id=parCon onkeyup='parSave()' rows=6 cols=21 style='width:100%'></TEXTAREA>"
        break;
      case "parCrd":
        sHTML += "Card Definition</div><TEXTAREA id=parCrd onkeyup='parSave()' rows=14 cols=21 style='width:100%'></TEXTAREA>"
        break;
      case "parKey":
        sHTML += "Key</div><INPUT type=text id=parKey onkeyup='parSave()' style='width:100%'>"
        break;
      case "parLMI":
        sHTML += "Minimum Score</div><INPUT type=text id=parLMI onkeyup='parSave()' style='width:100%'>"
        break;
      case "parPar":
        sHTML += "Parameters</div><TEXTAREA id=parPar onkeyup='parSave()' rows=6 cols=21 style='width:100%'></TEXTAREA>"
        break;
      case "parTyp":
        sHTML += "TYPE OF INPUT</div><INPUT type=text id=parTyp onkeyup='parSave()' style='width:100%'>"
        break;
      case "parURL":
        sHTML += "URL</div><TEXTAREA id=parURL onkeyup='parSave()' rows=6 cols=21 style='width:100%'></TEXTAREA>"
        break;
      case "parVar":
        sHTML += "VARIABLE</div><INPUT type=text id=parVar onkeyup='parSave()' style='width:100%'>"
        break;
      case "parTra":
        sHTML += "Translate Input</div><SELECT id=parTra onkeyup='parSave()' onchange='parSave()'>" +
          "<option>No</option>" +
          "<option>Yes</option>" +
          "</select>";
        break;
      case "parTro":
        sHTML += "Translate Output</div><SELECT id=parTro onkeyup='parSave()' onchange='parSave()'>" +
        "<option>No</option>" +
        "<option>Yes</option>" +
        "</select>";
        break;
      case "parTx0":
        sHTML += "VARIABLE</div><INPUT type=text id=parTx0 onkeyup='parSave()' style='width:100%'>"
        break;
      case "parTx1":
        sHTML += "VARIABLE</div><INPUT type=text id=parTx1 onkeyup='parSave()' style='width:100%'>"
        break;
      default:
        break;
    }
  }
  document.all("propList").innerHTML = sHTML;
  for (var f = 0; f < Fields.length; f++) {
    var field = Fields[f];
    if (field.default) {
      document.all(field.name).value = field.default;
    }
    if (field.title) {
      document.all("t_" + field.name).innerHTML = field.title;
    }
  }

  parLoad(data);
}
//#endregion

//#region SAVE & LOAD
var LoadAndSave = {
  prepareSave: function () {
    LoadAndSave.removeDataNodes();
    LoadAndSave.saveDiagramProperties();  // do this first, before writing to JSON

    var sDiagram = myDiagram.model.toJson();
    Tab.dialogs[Tab.selected]=sDiagram;

    if (Tab.tabs.length==1)
      Tab.tabs.push("+");
    var Flow=[];
    for (let index = 0; index < Tab.tabs.length-1; index++) {
      const element = Tab.dialogs[index];
      var botObject = LoadAndSave.convertDiagramToBot(element,Tab.tabs[index]);
      Flow=Flow.concat(botObject);
    }
    return { flow: Flow, dialogs:Tab.dialogs, tabs:Tab.tabs };
  },
  convertDiagramToBot: function (diagram,dialogName) {
    var goObj = JSON.parse(diagram);
    var botObject = [];
    for (var f = 0; f < goObj.nodeDataArray.length; f++) {
      var gO = goObj.nodeDataArray[f];

      var toLink = [];
      for (var g = 0; g < goObj.linkDataArray.length; g++) {
        var gL = goObj.linkDataArray[g];
        if (gL.from == gO.key) {
          toLink.push({ to: gL.to, text: (gL.text == undefined) ? "" : gL.text });
        }
      }
      botObject.push({
        key: gO.key, text: gO.text, type: gO.type, next: toLink,
        parVar: gO.parVar, parURL: gO.parURL, parKey: gO.parKey, parTyp: gO.parTyp, parLMI: gO.parLMI,
        parCon: gO.parCon, parPar: gO.parPar, parCar: gO.parCar, parAPI: gO.parAPI, parAPO: gO.parAPO,
        parCrd: gO.parCrd, parCkv: gO.parCkv, 
        parTx0: gO.parTx0, parTx1:gO.parTx1, parTro: gO.parTro, parTra:gO.parTra,
        dialog:dialogName
      })
    }
    return botObject;
  },
  removeDataNodes: function () {
    //REMOVE DATA NODES
    for (let index = myDiagram.model.nodeDataArray.length - 1; index >= 0; index--) {
      const element = myDiagram.model.nodeDataArray[index];
      if (element.type == "DATASHOW")
        myDiagram.model.removeNodeData(myDiagram.model.nodeDataArray[index]);
    }
  },
  saveDiagramProperties: function () {
    myDiagram.model.modelData.position = go.Point.stringify(myDiagram.position);
  },
  loadDiagramProperties: function (e) {
    // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
    var pos = myDiagram.model.modelData.position;
    if (pos) myDiagram.initialPosition = go.Point.parse(pos);
  }
}
//#endregion


var Bot = {
  dialogstack:[],
  messageID: 0,
  lastActivity: null,
  key: 0,
  translator:null,
  sendMessage: function (text, extension) {
    Bot.messageID++;
    var message = {
      activities: [Object.assign({
        "conversation": {
          "id": "something"
        },
        "id": Bot.messageID,
        "from": {
          "id": "something",
          "name": "someone",
          "role": "bot"
        },
        "recipient": {
          "id": "something",
          "name": "me",
          "role": "user"
        },
        "text": text,
        "say": text,
        "timestamp": "2018-10-18T15:21:07.82108Z",
        "type": "message",
        "channelId": "web"
      }, extension)]
    };
    DirectLineEmulator.emptyActivity = message;
  },
  userData: {},
  receiveMessage: function (activity) {
    if (activity != Bot.lastActivity) {
      $("#userdatavalue").html(JSON.stringify(Bot.userData));
      if (activity.text.toUpperCase().startsWith("BOT:")) {
        var message = activity.text.substr(4);

        Bot.key++;
        if (myDiagram.selection.count > 0) {
          var key = myDiagram.selection.first().key;
          var x = myDiagram.selection.first().part.location.x;
          var y = myDiagram.selection.first().part.location.y;
          y = y + 60;
          myDiagram.model.addNodeData({ "text": message, "type": "INPUT", "key": Bot.key, "loc": x + " " + y });
          myDiagram.select(myDiagram.findNodeForKey(Bot.key));

          myDiagram.model.addLinkData({ from: key, to: Bot.key });
        }
        else {
          if (myDiagram.model.nodeDataArray.length == 0)
            myDiagram.model.addNodeData({ "text": message, "type": "START", "figure": "Circle", "fill": "#00AD5F", "key": Bot.key });
          else
            myDiagram.model.addNodeData({ "text": message, "type": "INPUT", "key": Bot.key });
          myDiagram.select(myDiagram.findNodeForKey(Bot.key));
        }
      }
      else {
        Bot.processMessage(activity);
      }
      Bot.lastActivity = activity;
    }
  },
  processMessage(activity){
    //MOVE NEXT
    //LOOK AT 
    //var selectedDialog=Tab.Tabs[Tab.Selected];
    if (myDiagram.selection.count > 0) {
      var flow = LoadAndSave.prepareSave().flow;
      var condition = false;
      var key = myDiagram.selection.first().key;
      var a = searchArray(flow, key, "key")
      var toLang="";

      var userText=activity.text;
      if (a.parVar) {
        Bot.userData[a.parVar] = userText;
      }

      if (Bot.translator!=null)
      {
        //console.log(Bot.translator)
        toLang=Bot.userData[Bot.translator.variable];
        if (a.parTra=="Yes"){
          userText=translate(Bot.translator.key, userText, toLang, Bot.translator.to);
          if (a.parVar) {
            Bot.userData[a.parVar + "_" + toLang] = userText;
          }
        }
      }

      var topScoringIntent = "None";
      if (a.type == "LUIS") {
        //DO THE CALL
        var LUISResult = undefined;
        try {
          var url = a.parURL + "/luis/v2.0/apps/" + a.parPar + "?subscription-key=" + a.parKey + "&q=" + userText;
          var res = $.get({ url: url, async: false }).responseText;
          LUISResult = JSON.parse(res);
        } catch (error) {
          alert("ERROR IN LUIS PARAMETERS");
        }
        if (LUISResult) {
          topScoringIntent = LUISResult.topScoringIntent.intent;
          if (LUISResult.sentimentAnalysis) {
            Bot.userData[a.parVar + ".sentiment.label"] = LUISResult.sentimentAnalysis.label;
            Bot.userData[a.parVar + ".sentiment.score"] = LUISResult.sentimentAnalysis.score;
          }
          LUISResult.entities.forEach(element => {
            Bot.userData[a.parVar + "." + element.type] = element.entity;
          });
        }
        if (document.all("chkLUISDebug").checked) {
          LUISDebug(a, LUISResult);
        }
      }
      var extension=null;
      if (a.type == "SEARCH") {
        //DO THE CALL
        var SearchResult = undefined;
        try {
          var url = "https://" + a.parTx0 + ".search.windows.net/indexes/" + a.parTx1 + "/docs?search=" + encodeURI(userText) + "&api-version=2019-05-06&api-key=" + a.parKey;
          var res = $.get({
            url: url,
            async: false
          }).responseText;
          SearchResult = JSON.parse(res);
        } catch (error) {
          alert("ERROR IN SEARCH PARAMETERS");
        }
        if (SearchResult.value.length>0) {
          var at=[];
          for (let index = 0; index < SearchResult.value.length; index++) {
            const element = SearchResult.value[index];
            at.push(
              {
              "content": {
                "title": element[a.parAPI],
                "text": element[a.parTyp]
              },
              "contentType": "application/vnd.microsoft.card.hero"
              }
            );
              extension={"attachments":
                at, "attachmentLayout":"carousel" 
              };
            }
          //console.log(extension);

          if (a.parVar) {
            Bot.userData[a.parVar + "_Result"] = SearchResult;
          }
        }
      }
      var messages = [];
      var bailout=0;
      do {
        //console.log("A.TYPE:" + a.type)

        if (a.type == "QNA") {
          //DO THE CALL
          var QNAResult = undefined;
          try {
            var url = a.parURL + "/knowledgebases/" + a.parPar + "/generateAnswer";
            var headers = { "Authorization": "EndpointKey " + a.parKey, "Content-Type": "application/json" };
            var res = $.post({
              url: url,
              headers: headers,
              async: false,
              data: "{\"question\":\"" + encodeURI(userText) + "\"}"
            }).responseText;
            QNAResult = JSON.parse(res);
          } catch (error) {
            alert("ERROR IN QNA PARAMETERS");
          }
          if (QNAResult) {
            topScoringIntent = QNAResult.answers[0].answer;
  
            if (QNAResult.answers[0].context){
              var prompts=QNAResult.answers[0].context.prompts;
              if (prompts!=null){
                var buttons=[];
                for (let index = 0; index < prompts.length; index++) {
                  const element = prompts[index].displayText;
                  buttons.push(
                    {
                      "title": element,
                      "type": "imBack",
                      "value": element
                    }
                  );
                }
  
                if (buttons.length>0)
                  extension={"attachments":
                    [
                      {
                        "content": {
                          "buttons": buttons,
                          "text": topScoringIntent
                        },
                        "contentType": "application/vnd.microsoft.card.hero"
                      }
                    ]
                  };
              }
            }
  
            if (a.parVar) {
              Bot.userData[a.parVar + "_QNAResult"] = escape(JSON.stringify(QNAResult.answers[0]));
              Bot.userData[a.parVar + "_Result"] = topScoringIntent;
            }
          }
        }

        bailout++;
        condition = false;
        var text = userText;
        if (a.type == "IF") {
          text = Bot.ReplacePragmas(a.parCon)
          // console.log("IF");
          // console.log(text);
          text = eval(text).toString();
          // console.log("RESULT");
          // console.log(text);
        }
        if (a.type == "LUIS") {
          text = topScoringIntent;
        }
        if (a.type == "QNA") {
          if (extension!=null)
          {
            messages.push({ type: "MESSAGE", text:"",extension:extension });
            Bot.sendBotMessage(messages);
            return;
          }
          else
            messages.push({ type: "MESSAGE", text: topScoringIntent });
        }
        if (a.type == "SEARCH") {
          if (extension!=null)
          {
            messages.push({ type: "MESSAGE", text:"",extension:extension});
            Bot.sendBotMessage(messages);
          }
          else
            messages.push({ type: "MESSAGE", text: "No records found" });
        }
        if (a.type=="REST")
        {
          //REST= a
          var post = Bot.ReplacePragmas(a.parPar);
          var returnValue=RESTCall(post);
          var dom = jsel(JSON.parse(returnValue));
      
          //FILTER= a.parKey
          var results=dom.selectAll(a.parKey);
          var extension="";
          for (let index = 0; index < results.length; index++) {
              const element = results[index];

              var dom2 = jsel(element);

              //SEARCH a.parCrd for ${}
              var crd=a.parCrd;
              var p=1;
              while(p>0) {
                p=crd.indexOf("${");
                if (p>=0)
                {
                  var pd=crd.indexOf("}",p);
                  var field=crd.substring(p+2,pd);

                  var text=dom2.select(field);

                  crd=crd.substring(0,p) + text + crd.substring(pd+1);
                }
              }

              if (extension!="")
                  extension+=","
              extension+=crd;
          }
          extension="[" + extension + "]";
      
          messages.push({ type: "REST", text: "", attachmentLayout:"carousel", extension:{ "attachments": JSON.parse(extension) } });
        }
        if (a.type=="START"){
          if (a.parTra=="Yes"){
            Bot.translator={key:a.parKey, to:a.parAPI, variable:a.parVar};
          }
          else
            Bot.translator=null;
        }
        if (a.type=="DIALOGEND")
        {
          //RETURN TO PREVIOUS DIALOG
          var currentPos=Bot.dialogstack.pop();
          Tab.sel(currentPos.previousTab);
          //find currentPos.key
          var goto = searchArray(flow, currentPos.key, "key");
          a.next=goto.next;
          myDiagram.select(myDiagram.findNodeForKey(currentPos.key));
        }

        var FieldDefinition=GetTypeDefinition(a.type)

        var nxt = Bot.getNext(a.next, text);
        //CHECK INVALID CHOICE
        if (!nxt && FieldDefinition.needValidChoice=="true")
        {
          nxt=a.key;
        }
        if (activity.playStep)
        {
          activity.playStep=null;
          nxt=myDiagram.selection.first().key;
        }
        if (nxt) {
          var goto = searchArray(flow, nxt, "key")
          var FieldDefinition=GetTypeDefinition(goto.type)
          var bSendMessage = true;
          if (FieldDefinition.showMessage=="false")
            bSendMessage = false;
          if (goto.type == "INPUT") {
            if (goto.parCkv == "No" && Bot.userData[goto.parVar]) {
              bSendMessage = false;
              condition = true;
            }
          }
          if (goto.type == "QNA") {
            if (goto.parCkv == "No" && Bot.userData[goto.parVar]) {
              bSendMessage = false;
              condition = true;
            }
          }

          if (goto.type == "DIALOG") {
            var tabSel=Tab.getTabIndexFromName(goto.parAPI);
            if (tabSel==-1)
            {
              goto.text = "ERROR: Couldn't find Dialog " + goto.parAPI;
              messages.push(goto);
            }
            else{
              var currentTab=Tab.selected;
              Tab.sel(tabSel);

              var bFound=false;
              for (let index = 0; index < flow.length; index++) {
                const element = flow[index];
                if (element.dialog==goto.parAPI && element.type=="DIALOGSTART")
                {
                  nxt=element.key;
                  bFound=true;
                  //ADD TO THE DIALOG STACK
                  Bot.dialogstack.push({dialog:a.dialog, key:goto.key, previousTab:currentTab});

                  break;
                }
              }
              if (!bFound)
              {
                goto.text = "ERROR: No Start Dialog activity found!";
                messages.push(goto);
              }
            }
          }
          if (goto.type == "RESETVAR") {
            var a = goto.parVar.split(",");
            for (let index = 0; index < a.length; index++) {
              const element = a[index];
              delete Bot.userData[element];
            }
          }

          if (bSendMessage) {
            if (goto.parTro=="Yes" && Bot.translator)
            {
              goto.text=translate(Bot.translator.key, goto.text, Bot.translator.to,toLang);
            }
            messages.push(goto);
          }

          myDiagram.select(myDiagram.findNodeForKey(nxt));

          var a = searchArray(flow, nxt, "key")
          FieldDefinition=GetTypeDefinition(a.type)
          if (FieldDefinition.waitForUserInput!="true")
            condition = true;
          if (a.type=="CARD")
          {
            if (a.parTra=="No"){
              condition=true;
            }
          }
        }
        else {
          messages.push({ type: "MESSAGE", text: "<end of flow>" });
        }
      } while (condition && bailout<100);
      $("#userdatavalue").html(JSON.stringify(Bot.userData));
      Bot.sendBotMessage(messages);
    }
    else {
      Bot.sendMessage("Design flow and then interact with it");
    }

  },
  getNext: function (nextOptions, message) {
    //TODO: evaluate nextOption
    if (nextOptions.length <= 0) {
      return undefined;
    }
    else
      if (nextOptions.length == 1) {
        return nextOptions[0].to;
      }
      else {
        for (let i = 0; i < nextOptions.length; i++) {
          const element = nextOptions[i];

          if (element.text == message) {
            return element.to;
          }
        }
        return undefined;
      }
  },
  sendBotMessage(flowItems) {
    //TODO: render message based on the type
    var activities = [];
    for (let i = 0; i < flowItems.length; i++) {
      const flowItem = flowItems[i];
      var attachmentLayout="";

      var extension=flowItem.extension;
      switch (flowItem.type) {
        case "CARD":
          flowItem.text = "";
          switch (flowItem.parCar) {
            case "carousel":
              var cardText = Bot.ReplacePragmas(flowItem.parCrd);
              extension = { "attachments": JSON.parse(flowItem.parCrd) };
              attachmentLayout="carousel";
              break;
            case "adaptiveCard":
              var cardText = Bot.ReplacePragmas(flowItem.parCrd);

              extension = {
                "attachments": [
                  {
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "content": JSON.parse(cardText)
                  }
                ]
              };
              break;
            default:
              extension = { "attachments": [JSON.parse(flowItem.parCrd)] };
              break;
          }
          break;
        case "CHOICE":
          var actions = [];
          flowItem.next.forEach(element => {
            var t = Bot.ReplacePragmas(element.text);
            actions.push({ title: t, type: "imBack", value: t });
          });
          extension = { "suggestedActions": { "actions": actions } };
          break;
        case "IF":
          break;
        case "LUIS":
          break;
        case "REST":
          attachmentLayout=flowItem.attachmentLayout;
          extension=flowItem.extension;
          break;
        default:
          break;
      }

      Bot.messageID++;
      var t = Bot.ReplacePragmas(flowItem.text);
      activities.push(Object.assign({
        "conversation": {
          "id": "something"
        },
        "id": Bot.messageID,
        "from": {
          "id": "something",
          "name": "someone",
          "role": "bot"
        },
        "recipient": {
          "id": "something",
          "name": "me",
          "role": "user"
        },
        "text": t,
        "timestamp": (new Date).toISOString(),
        "type": "message",
        "attachmentLayout":attachmentLayout,
        "channelId": "web",
      }, extension));
      //Bot.sendMessage(flowItem.text, extension);
      var message = { activities: activities };
    }
    DirectLineEmulator.emptyActivity = message;
  },
  ReplacePragmas: function (text) {
    for (var attrname in Bot.userData) {
      text = text.replace("{" + attrname + "}", Bot.userData[attrname]);
    }
    return text;
  }
}

//#region HELPERS
function compare(a, b) {
  if (a.newIndex < b.newIndex)
    return -1;
  if (a.newIndex > b.newIndex)
    return 1;
  return 0;
}
function readTextFilePromise(file) {
  return new Promise(function (resolve, reject) {
    readTextFile(file, resolve);
  });
}
function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        var allText = rawFile.responseText;
        callback(allText);
      }
    }
  }
  rawFile.send(null);
}
function replaceAll(text, search, replacement) {
  text += "";
  return text.replace(new RegExp(search, 'g'), replacement);
};
function searchArray(myArray, nameKey, prop,dialog) {
  if (!dialog)
    dialog=Tab.tabs[Tab.selected];
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i][prop] === nameKey && myArray[i]["dialog"]==dialog) {
      return myArray[i];
    }
  }
}
//#endregion

//TAKE ENTITIES
var LUISversion = "";
var LUISURL = "";
var LUISKey = "";
function LUISAddUtterance() {
  var query = $("#DebugLUISQuery").html();
  $.ajax({
    method: "POST",
    url: LUISURL + "0.1/example",
    headers: { "Ocp-Apim-Subscription-Key": LUISKey },
    data: {
      "text": query,
      "intentName": $("#newIntent").val(),
      "entityLabels": []
    },
    success: function (data) {
      //console.log(data);
    },
    error: function (data) {
      //console.log(data);
      alert("Failed to add Utterance");
    }
  });
}
function LUISDebug(step, LUISResult) {
  LUISURL = step.parURL + "/luis/api/v2.0/apps/" + step.parPar + "/versions/";
  LUISKey = step.parKey;
  $.ajax({
    url: LUISURL + "0.1/export",
    headers: { "Ocp-Apim-Subscription-Key": LUISKey },
    success: function (LUISModel) {
      //console.log(LUISModel.intents)
      $('#newIntent').empty()
      LUISModel.intents.forEach(intent => {
        $("#newIntent").append(new Option(intent.name, intent.name));
      });
      var topIntent = $('#DebugLUISTopIntentVal').val();
      $("#newIntent").val(topIntent);

      var query = $("#DebugLUISQuery").html();
      var foundUtterance = false;
      for (let index = 0; index < LUISModel.utterances.length; index++) {
        const utterance = LUISModel.utterances[index];
        if (utterance.text == query && utterance.intent == topIntent) {
          foundUtterance = true;
          break;
        }
      }
      if (foundUtterance)
        document.all("divReassignIntent").style.display = "None";
      else
        document.all("divReassignIntent").style.display = "block";
    }
  });


  var ents = LUISResult.entities;
  var query = LUISResult.query;
  ents.sort(comparePos);
  ents.forEach(element => {
    LUISResult.entities
    var variable = query.substring(element.startIndex, element.endIndex + 1);
    query = query.substring(0, element.startIndex) + "{" + element.type + "=" + variable + "}" + query.substring(element.endIndex + 1);
  });
  $('#DebugLUISTopIntentVal').val(LUISResult.topScoringIntent.intent);
  $('#DebugLUISQuery').html(LUISResult.query);
  $('#DebugLUISUnderstood').html(query);
  $('#DebugLUISTopIntent').html(LUISResult.topScoringIntent.intent + " (" + LUISResult.topScoringIntent.score + ")");

  $('#DebugLUIS').modal();
}
function comparePos(a, b) {
  if (a.startIndex < b.startIndex)
    return 1;
  if (a.startIndex > b.startIndex)
    return -1;
  return 0;
}


function parseREST(command){
  //POST url
  //headers
  //(empty)
  //data
  var lines=command.split('\n');
  lines[0]=lines[0].trim();
  var p=lines[0].indexOf(' ');
  var verb="GET";
  var url=lines[0];
  if (p>0)
  {
    verb=lines[0].substring(0,p);
    url=lines[0].substring(p+1);
  }
  var header="";
  var index;
  for (index = 1; index < lines.length; index++) {
    const element = lines[index].trim();
    if (element=="")
      break;
    else{
      p=element.indexOf(':');
      if (p<=0)
        return {error:"no header dev"}
      if (header!="")        
        header+=",";
      header+="\"" + element.substring(0,p).trim() + "\":\"" + element.substring(p+1).trim() + "\"";
    }
  }
  header="{" + header + "}";

  var data="";
  for (index=index;index < lines.length; index++) {
    data+=lines[index];
  }
  return {verb:verb, url:url, headers:JSON.parse(header), data:data};
}
function RESTCall(s){
  var r=parseREST(s);
  return ($.ajax({
      method:r.verb,
      url:r.url,
      headers:r.headers,
      data:r.data,
      async:false,
      error:function(x,message){
        alert(message)
      }
  }).responseText);
}
function translate(key,text,from,to){
  if (from==to || !to || !from)
    return text;
  var res=$.ajax({
    method:"POST",
    url:"https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=" + from + "&to=" + to,
    headers:{"Content-Type":"application/json","Ocp-Apim-Subscription-Key": key},
    data:JSON.stringify([{"Text":text}]),
    async:false,
    error:function(x,message){
      alert(message)
    }
  }).responseText;
  res=JSON.parse(res)[0].translations[0].text;
  return res;
}

var Tab={
  tabs:[],
  selected:-1,
  dialogs:[],
  add:function(){
    var tabName=prompt("Dialog Name","new");
    if (tabName){
      var n=Tab.tabs.length-1;
      Tab.tabs[n]=tabName;
      Tab.tabs.push("+");
      Tab.draw();
      Tab.dialogs.push({ "class": "go.GraphLinksModel",  "modelData": {"position":"-5 -5"},  "nodeDataArray": [ {"text":"Start\nDialog", "figure":"Circle", "fill":"#00AD5F", "type":"DIALOGSTART", "key":-14, "loc":"100 60"},{"text":"End\nDialog", "figure":"Circle", "fill":"#00AD5F", "type":"DIALOGEND", "key":-15, "loc":"100 490"} ],  "linkDataArray": [ {"from":-14, "to":-15, "points":[100,94.09738338825315,100,104.09738338825315,100,275,100,275,100,445.90261661174685,100,455.90261661174685]} ]}
        );
      Tab.sel(n);
    }
  },
  init:function(){
    Tab.tabs=["Main","+"];
    Tab.dialogs=[];
    Tab.dialogs.push({});
    Tab.draw();
    Tab.sel(0);
    $(".css-ljhy6a.css-7c9av6").html("");
  },
  sel:function(nTab){
    if (Tab.selected!=-1){
      $("#tab" + Tab.selected).removeClass("tabsel");
      Tab.dialogs[Tab.selected]=myDiagram.model.toJson();
    }
    Tab.selected=nTab;
    $("#tab" + nTab).addClass("tabsel");
    myDiagram.model = go.Model.fromJson(Tab.dialogs[Tab.selected]);

    //DRAW SCENARIO
  },
  draw:function(){
    sH="";
    for (let index = 0; index < Tab.tabs.length; index++) {
      const element = Tab.tabs[index];
      if (element=="+")
        sH+=`<div id="tab${index}" onclick="Tab.add()">${element}</div>`;
      else
        sH+=`<div id="tab${index}" onclick="Tab.sel(${index})">${element}</div>`;
    }
    $("#tabhost").html(sH);
    $("#tab" + Tab.selected).addClass("tabsel");
  },
  getTabIndexFromName(tabName){
    for (let index = 0; index < Tab.tabs.length; index++) {
      if (Tab.tabs[index]==tabName)
      {
        return index;
      }
    }
    return -1;
  }
}