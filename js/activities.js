// //#region SYNC AND PLAY THE STEP THAT IS SELECTED
// function onDrawingEvent(data){
//   myDiagram.select(myDiagram.findPartForKey(Number(data)));
// }
// //#endregion

// //#region SHOW DATA
// function showDataNodes(data){
//   LoadAndSave.removeDataNodes();
//   myDiagram.startTransaction("make new node");
//   var total=myDiagram.model.nodeDataArray.length;
//   for (let index = 0; index < total; index++) {
//     const element = myDiagram.model.nodeDataArray[index];
//     if (element.parVar!="")
//     {
//       var text=data[element.parVar];
//       if (text!="" && text){
//         var b=go.Point.parse(element.loc).offset(20,20);
//         if ("#MESSAGE#START#".indexOf("#" + element.type + "#")<0)
//           myDiagram.model.addNodeData(    
//             {"text":text, 
//             "fill":"#FFFFE0", "loc":go.Point.stringify(b), "angle":0, "size":"100 50", 
//             "opacity":0.7,
//             "type":"DATASHOW"}
//           );
//       }

//     }
//   }
//   myDiagram.commitTransaction("make new node");
// }
// //#endregion

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
  console.log("ATT:" + parCar)
  console.log(JSON.stringify(attachments))
  //document.all("parCrd").innerText=JSON.stringify(attachments);
}

function parSave() {
  var node = myDiagram.selection.first();
  if (node) {
    var data = node.data;
    for (var f = 0; f < ParameterList.length; f++) {
      var name = ParameterList[f].name;
      if (document.all(name)) {
        //console.log(name + "->" + document.all(name).type)
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
  { name: "parCkv", default: "yes" } //Check if variable exists
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
function DisplayProperties(data) {
  //BUILD FIELDS ACCORDING TO TYPE
  var Fields = GetFieldList(data.type);
  var sHTML = "<div>KEY & TYPE</div>" + data.key + "(" + data.type + ")<div>TEXT</div>" + data.text;
  for (var f = 0; f < Fields.length; f++) {
    var field = Fields[f];
    sHTML += "<div id=t_" + field.name + ">";
    switch (field.name) {
      case "parCrd":
        sHTML += "Card Definition</div><TEXTAREA id=parCrd onkeyup='parSave()' rows=14 cols=21 style='width:180px'></TEXTAREA>"
        break;
      case "parVar":
        sHTML += "VARIABLE</div><INPUT type=text id=parVar onkeyup='parSave()' style='width:180px'>"
        break;
      case "parTyp":
        sHTML += "TYPE OF INPUT</div><INPUT type=text id=parTyp onkeyup='parSave()' style='width:180px'>"
        break;
      case "parURL":
        sHTML += "URL</div><TEXTAREA id=parURL onkeyup='parSave()' rows=6 cols=21 style='width:180px'></TEXTAREA>"
        break;
      case "parKey":
        sHTML += "Key</div><INPUT type=text id=parKey onkeyup='parSave()' style='width:180px'>"
        break;
      case "parLMI":
        sHTML += "Minimum Score</div><INPUT type=text id=parLMI onkeyup='parSave()' style='width:90px'>"
        break;
      case "parPar":
        sHTML += "Parameters</div><TEXTAREA id=parPar onkeyup='parSave()' rows=6 cols=21 style='width:180px'></TEXTAREA>"
        break;
      case "parCon":
        sHTML += "Condition</div><TEXTAREA id=parCon onkeyup='parSave()' rows=6 cols=21 style='width:180px'></TEXTAREA>"
        break;
      case "parCkv":
        sHTML += "Prompt even if variable already defined</div><SELECT id=parCkv onkeyup='parSave()' onchange='parSave()'>" +
          "<option>Yes</option>" +
          "<option>No</option>" +
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
          "</select>";
        break;
      case "parAPI":
        sHTML += "API or URL</div><INPUT type=text id=parAPI onkeyup='parSave()' style='width:180px'>"
        break;
      case "parAPO":
        sHTML += "API Output</div><SELECT id=parAPO onkeyup='parSave()' onchange='parSave()'>" +
          "<option>None</option>" +
          "<option>Variable</option>" +
          "<option>MessageContent</option>" +
          "</select>";
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
    var Flow = LoadAndSave.convertDiagramToBot(sDiagram);
    return { flow: Flow, diagram: JSON.parse(sDiagram) }
  },
  convertDiagramToBot: function (diagram) {
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
        parCrd: gO.parCrd, parCkv: gO.parCkv
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
  messageID: 0,
  lastActivity: null,
  key: 0,
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
      // console.log("USER ACTIVITY:")
      // console.log(activity);
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
        //MOVE NEXT
        if (myDiagram.selection.count > 0) {
          var flow = LoadAndSave.prepareSave().flow;
          var condition = false;
          var key = myDiagram.selection.first().key;
          var a = searchArray(flow, key, "key")

          if (a.parVar) {
            Bot.userData[a.parVar] = activity.text;
          }

          var topScoringIntent = "None";
          if (a.type == "LUIS") {
            //DO THE CALL
            var LUISResult = undefined;
            try {
              var url = a.parURL + "/luis/v2.0/apps/" + a.parPar + "?subscription-key=" + a.parKey + "&q=" + activity.text;
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
              //console.log(topScoringIntent);
            }
            if (document.all("chkLUISDebug").checked) {
              LUISDebug(a, LUISResult);
            }
          }
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
                data: "{\"question\":\"" + encodeURI(activity.text) + "\"}"
              }).responseText;
              QNAResult = JSON.parse(res);
            } catch (error) {
              alert("ERROR IN QNA PARAMETERS");
            }
            if (QNAResult) {
              console.log(QNAResult);
              topScoringIntent = QNAResult.answers[0].answer;
            }
          }

          var messages = [];
          do {
            condition = false;
            var text = activity.text;
            if (a.type == "IF") {
              text = Bot.ReplacePragmas(a.parCon)
              text = eval(text).toString();
            }
            //console.log("A.TYPE:" + a.type);
            if (a.type == "LUIS") {
              text = topScoringIntent;
            }
            if (a.type == "QNA") {
              messages.push({ type: "MESSAGE", text: topScoringIntent });
            }
            var nxt = Bot.getNext(a.next, text);
            //CHECK INVALID CHOICE
            if (a.type == "CHOICE" && !nxt)
              nxt = a.key;
            if (a.type == "LUIS" && !nxt)
              nxt = a.key;
            if (nxt) {
              var goto = searchArray(flow, nxt, "key")
              var bSendMessage = true;
              if (goto.type == "IF") {
                bSendMessage = false;
              }
              if (goto.type == "INPUT") {
                // console.log("INPUT")
                // console.log(goto.type)
                if (goto.parCkv == "No" && Bot.userData[goto.parVar]) {
                  // console.log("DO NOT SHOW")
                  bSendMessage = false;
                  condition = true;
                }
              }
              if (goto.type == "DIALOG") {
                goto.text = "Transfer to Dialog " + goto.parAPI;
                messages.push(goto);
                condition = false;
                bSendMessage = false;
              }
              if (goto.type == "RESETVAR") {
                var a = goto.parVar.split(",");
                for (let index = 0; index < a.length; index++) {
                  const element = a[index];
                  delete Bot.userData[element];
                }
                bSendMessage = false;
              }
              if (bSendMessage) {
                messages.push(goto);
              }

              myDiagram.select(myDiagram.findNodeForKey(nxt));

              var a = searchArray(flow, nxt, "key")
              if (a.type == "MESSAGE" || a.type == "START" || a.type == "API" || a.type == "IF" || a.type == "RESETVAR")
                condition = true;
            }
            else {
              messages.push({ type: "MESSAGE", text: "<end of flow>" });
            }
          } while (condition);
          $("#userdatavalue").html(JSON.stringify(Bot.userData));
          // console.log("MESSAGES")
          // console.log(messages)
          Bot.sendBotMessage(messages);
        }
        else {
          Bot.sendMessage("Design flow and then interact with it");
        }
      }
      Bot.lastActivity = activity;
    }
  },
  getNext: function (nextOptions, message) {
    //TODO: evaluate nextOption
    //console.log("LENGTH:" + nextOptions.length);
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


      var extension;
      switch (flowItem.type) {
        case "CARD":
          switch (flowItem.parCar) {
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
              flowItem.text = "";
              break;
            default:
              extension = { "attachments": [JSON.parse(flowItem.parCrd)] };
              break;
          }
          console.log(extension);
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
          // var actions=[];
          // flowItem.next.forEach(element => {
          //   var t=Bot.ReplacePragmas(element.text);
          //   actions.push({title:t, type:"imBack", value:t});
          // });
          // extension={"suggestedActions": {"actions":actions}};
          break;
        case "LUIS":
          // var actions=[];
          // flowItem.next.forEach(element => {
          //   var t=Bot.ReplacePragmas(element.text);
          //   actions.push({title:t, type:"imBack", value:t});
          // });
          // extension={"suggestedActions": {"actions":actions}};
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
        "channelId": "web",
      }, extension));
      //Bot.sendMessage(flowItem.text, extension);
      //console.log(activities);
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
function searchArray(myArray, nameKey, prop) {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i][prop] === nameKey) {
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
      console.log(data);
    },
    error: function (data) {
      console.log(data);
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